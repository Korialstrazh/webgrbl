import {
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_CONTROLLER_PHASE,
  GRBL_LINE_ORIGIN,
  GRBL_MACHINE_STATE,
  GRBL_REALTIME_COMMAND,
  GRBL_STATUS_POLL_INTERVAL_MS,
  GRBL_UNLOCK_COMMAND,
} from './grbl.constants';
import { GrblCommandWriter } from './grbl.command.writer';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { GrblControllerBusyError } from './grbl.controller.busy.error';
import { performGrblHandshake } from './grbl.handshake';
import { newGrblHandshakeContext } from './grbl.handshake.context';
import { GrblLineFramer } from './grbl.line.framer';
import { getPreparedGrblLine } from './grbl.line.preparer';
import { GrblMachineControls } from './grbl.machine.controls';
import { GrblNonAsciiLineError } from './grbl.non.ascii.line.error';
import { GrblNotRespondingWatchdog } from './grbl.not.responding.watchdog';
import { isPrintableAsciiGrblLine } from './grbl.printable.ascii.line';
import { GrblProgramStreamer } from './grbl.program.streamer';
import { GrblResponseRouter } from './grbl.response.router';
import { GrblStatusPoller } from './grbl.status.poller';
import { GrblStatusTracker } from './grbl.status.tracker';
import type { GrblControllerPhase, GrblMachineState } from './grbl.constants';
import type { GrblConnectionInfo } from './interfaces/GrblConnectionInfo';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblFirmwareIdentity } from './interfaces/GrblFirmwareIdentity';
import type { GrblProgramLineError } from './interfaces/GrblProgramLineError';
import type { GrblProgramResult } from './interfaces/GrblProgramResult';
import type { GrblProgramStreamOptions } from './interfaces/GrblProgramStreamOptions';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { SerialTransport } from './interfaces/SerialTransport';

/** Receives every controller event. */
type GrblControllerEventListener = (event: GrblControllerEvent) => void;

/** Receives every banner while set. */
type GrblBannerListener = (identity: GrblFirmwareIdentity) => void;

/** Cancels the running handshake with the given error. */
type GrblHandshakeCanceller = (error: Error) => void;

/** States in which closing the port without a stop would leave the machine moving. */
const MOVING_MACHINE_STATES: readonly GrblMachineState[] = [GRBL_MACHINE_STATE.RUN, GRBL_MACHINE_STATE.JOG];

/**
 * Drives one GRBL controller over a serial transport: handshake, status polling, console commands, program streaming
 * and check mode, stop, reset and hold controls, and typed events. Its collaborators do the work: GrblCommandWriter
 * writes, GrblResponseRouter routes what arrives, GrblMachineControls stops and resets, GrblProgramStreamer streams
 * and checks programs, GrblNotRespondingWatchdog watches for silence. Framework-free, so the Redux bridge owns one
 * instance.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblController {
  /** The byte pipe to the controller. */
  private readonly transport: SerialTransport;
  /** Turns received chunks into complete lines. */
  private readonly lineFramer: GrblLineFramer = new GrblLineFramer();
  /** Everyone told about controller events. */
  private readonly eventListeners: Set<GrblControllerEventListener> = new Set();
  /** Told about banners while the handshake waits for one. */
  private bannerListener: GrblBannerListener | undefined;
  /** Latest status with resolved positions. */
  private readonly statusTracker: GrblStatusTracker = new GrblStatusTracker();
  /** Cancels the running handshake; set only while one runs. */
  private handshakeCanceller: GrblHandshakeCanceller | undefined;
  /** Disconnected, connecting (handshake running) or connected (handshake done). */
  private phase: GrblControllerPhase = GRBL_CONTROLLER_PHASE.DISCONNECTED;
  /** Writes queued lines, private lines and realtime bytes. */
  private readonly commandWriter: GrblCommandWriter;
  /** Sends the status query at an interval while connected. */
  private readonly statusPoller: GrblStatusPoller;
  /** Stop, reset, feed hold and cycle resume. */
  private readonly machineControls: GrblMachineControls;
  /** Streams and checks programs. */
  private readonly programStreamer: GrblProgramStreamer;
  /** Reports a silent controller. */
  private readonly notRespondingWatchdog: GrblNotRespondingWatchdog;
  /** Routes every received line. */
  private readonly responseRouter: GrblResponseRouter;

  public constructor(transport: SerialTransport) {
    const emitEvent = (event: GrblControllerEvent): void => this.emitEvent(event);
    const isConnected = (): boolean => this.phase === GRBL_CONTROLLER_PHASE.CONNECTED;

    this.transport = transport;
    this.commandWriter = new GrblCommandWriter(transport, emitEvent);
    this.statusPoller = new GrblStatusPoller(
      (): void => void this.commandWriter.writeRealtimeCommand(GRBL_REALTIME_COMMAND.STATUS_QUERY),
    );
    this.notRespondingWatchdog = new GrblNotRespondingWatchdog({
      hasInFlightLines: (): boolean => this.commandWriter.hasInFlightLines(),
      getLatestStatus: (): GrblResolvedStatus | undefined => this.statusTracker.getLatestStatus(),
      emitEvent,
    });
    this.machineControls = new GrblMachineControls({
      commandWriter: this.commandWriter,
      statusPoller: this.statusPoller,
      statusTracker: this.statusTracker,
      isConnected,
      addEventListener: (listener: GrblControllerEventListener): (() => void) => this.addEventListener(listener),
      handleMachineReset: (): void => this.programStreamer.handleMachineReset(),
      handleBannerWaitEnded: (): void => this.programStreamer.handleBannerWaitEnded(),
      emitEvent,
      reportNotResponding: (): void => this.notRespondingWatchdog.reportNotResponding(),
    });
    this.programStreamer = new GrblProgramStreamer({
      commandWriter: this.commandWriter,
      isConnected,
      stopMachine: (): Promise<void> => this.stopMachine(),
      holdQueueUntilCheckModeBanner: (): void => this.machineControls.holdQueueUntilCheckModeBanner(),
      emitEvent,
    });
    this.responseRouter = new GrblResponseRouter({
      commandWriter: this.commandWriter,
      statusTracker: this.statusTracker,
      machineControls: this.machineControls,
      programStreamer: this.programStreamer,
      notRespondingWatchdog: this.notRespondingWatchdog,
      emitEvent,
      handleHandshakeBanner: (identity: GrblFirmwareIdentity): void => this.bannerListener?.(identity),
    });
    this.transport.setReceiveListener((chunk: Uint8Array): void => this.handleReceivedChunk(chunk));
    this.transport.setConnectionLostListener((): void => this.handleConnectionLost());
  }

  /**
   * Opens the transport and runs the handshake. Rejects with GrblHandshakeError when the controller is unusable,
   * GrblConnectionClosedError when disconnected or lost meanwhile, and GrblControllerBusyError when already
   * connecting or connected.
   */
  public async connect(): Promise<GrblConnectionInfo> {
    if (this.phase !== GRBL_CONTROLLER_PHASE.DISCONNECTED) {
      throw new GrblControllerBusyError();
    }

    this.phase = GRBL_CONTROLLER_PHASE.CONNECTING;
    this.statusTracker.clearTrackedStatus();

    try {
      const connectionInfo: GrblConnectionInfo = await performGrblHandshake(newGrblHandshakeContext({
        transport: this.transport,
        commandWriter: this.commandWriter,
        setBannerListener: (listener: GrblBannerListener | undefined): void => {
          this.bannerListener = listener;
        },
        setHandshakeCanceller: (canceller: GrblHandshakeCanceller | undefined): void => {
          this.handshakeCanceller = canceller;
        },
      }));

      this.commandWriter.setRxBufferSize(connectionInfo.rxBufferSize);
      this.phase = GRBL_CONTROLLER_PHASE.CONNECTED;
      this.statusPoller.startPolling(GRBL_STATUS_POLL_INTERVAL_MS);
      this.notRespondingWatchdog.startWatching();

      return connectionInfo;
    } catch (error: unknown) {
      // A closed connection was already released by whoever closed it, possibly before a new connect() started.
      if (!(error instanceof GrblConnectionClosedError)) {
        this.releaseConnectionState();
      }

      throw error;
    }
  }

  /**
   * Stops polling, drops queued lines and closes the transport. A machine that runs or jogs, or still holds lines of a
   * program or the queue, is stopped first, so closing the port never leaves it moving with nobody able to stop it.
   */
  public async disconnect(): Promise<void> {
    if (this.isStopNeededBeforeClose()) {
      await this.stopMachine();
    }

    const wasTransportOpen: boolean = this.phase !== GRBL_CONTROLLER_PHASE.DISCONNECTED;

    this.releaseConnectionState();

    if (wasTransportOpen) {
      await this.transport.close();
    }
  }

  /**
   * Prepares a typed line and queues it. A line that is empty after preparation is ignored, and so is any line
   * before the handshake is done: the reset would wipe it while it still counted as in flight, so $I's ok would
   * acknowledge it. Throws GrblNonAsciiLineError, sending nothing, for a line with a character outside printable
   * ASCII.
   */
  public sendConsoleCommand(commandText: string): void {
    const preparedLine: string | undefined = getPreparedGrblLine(commandText);

    if (!preparedLine) {
      return;
    }

    if (!isPrintableAsciiGrblLine(preparedLine)) {
      throw new GrblNonAsciiLineError();
    }

    if (this.phase === GRBL_CONTROLLER_PHASE.CONNECTED) {
      this.commandWriter.enqueueLine(preparedLine, GRBL_LINE_ORIGIN.CONSOLE);
    }
  }

  /**
   * Streams a program; resolves with how it ended (see GrblProgramStreamer). Rejects with GrblControllerBusyError
   * while a program or check runs and with GrblConnectionClosedError while disconnected.
   */
  public streamProgram(programLines: string[], options: GrblProgramStreamOptions): Promise<GrblProgramResult> {
    return this.programStreamer.streamProgram(programLines, options);
  }

  /** Checks a program in GRBL check mode and resolves with its line errors (see runGrblCheckMode). */
  public checkProgram(programLines: string[]): Promise<GrblProgramLineError[]> {
    return this.programStreamer.checkProgram(programLines);
  }

  /**
   * Stops the machine as fast as possible without losing its position (see runGrblStopSequence). Resolves once the
   * reset byte is written; a stop requested while one runs returns the running stop.
   */
  public stopMachine(): Promise<void> {
    return this.machineControls.stopMachine();
  }

  /** Writes the soft reset at once and drops all queued and in-flight lines. */
  public resetMachine(): Promise<void> {
    return this.machineControls.resetMachine();
  }

  /** Queues $X, which clears the Alarm lock, as a console line. */
  public unlockMachine(): void {
    this.sendConsoleCommand(GRBL_UNLOCK_COMMAND);
  }

  /** Writes the feed hold realtime command, which pauses motion. */
  public sendFeedHold(): Promise<void> {
    return this.machineControls.writeConnectedRealtimeCommand(GRBL_REALTIME_COMMAND.FEED_HOLD);
  }

  /** Writes the cycle resume realtime command, which continues motion after a feed hold. */
  public sendCycleResume(): Promise<void> {
    return this.machineControls.writeConnectedRealtimeCommand(GRBL_REALTIME_COMMAND.CYCLE_RESUME);
  }

  /** Adds an event listener and returns the function that removes it. */
  public addEventListener(listener: GrblControllerEventListener): () => void {
    this.eventListeners.add(listener);

    return (): void => {
      this.eventListeners.delete(listener);
    };
  }

  public getLatestStatus(): GrblResolvedStatus | undefined {
    return this.statusTracker.getLatestStatus();
  }

  /**
   * Forgets everything tied to the current connection; a running handshake and waiting private commands fail, and a
   * running program ends.
   */
  private releaseConnectionState(): void {
    this.phase = GRBL_CONTROLLER_PHASE.DISCONNECTED;
    this.handshakeCanceller?.(new GrblConnectionClosedError());
    this.machineControls.releaseMachineControls();
    this.programStreamer.releaseProgram(new GrblConnectionClosedError());
    this.notRespondingWatchdog.stopWatching();
    this.statusPoller.stopPolling();
    this.commandWriter.releaseAllLines(new GrblConnectionClosedError());
    this.lineFramer.reset();
  }

  private handleConnectionLost(): void {
    if (this.phase === GRBL_CONTROLLER_PHASE.DISCONNECTED) {
      return;
    }

    this.releaseConnectionState();
    this.emitEvent({ kind: GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST });
  }

  private handleReceivedChunk(chunk: Uint8Array): void {
    for (const lineText of this.lineFramer.getCompleteLines(chunk)) {
      this.responseRouter.routeReceivedLine(lineText);
    }
  }

  /** A program that just started may still show Idle, so queued and running work counts as well as the state. */
  private isStopNeededBeforeClose(): boolean {
    const machineState: GrblMachineState | undefined = this.statusTracker.getLatestStatus()?.machineState;
    const isMachineMoving: boolean = !!machineState && MOVING_MACHINE_STATES.includes(machineState);
    const hasPendingWork: boolean = this.programStreamer.isProgramActive() || this.commandWriter.hasUnansweredLines();

    return this.phase === GRBL_CONTROLLER_PHASE.CONNECTED && (isMachineMoving || hasPendingWork);
  }

  private emitEvent(event: GrblControllerEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }
}
