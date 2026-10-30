import {
  GRBL_CONSOLE_DIRECTION,
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_CONTROLLER_PHASE,
  GRBL_EMPTY_TEXT,
  GRBL_LINE_ORIGIN,
  GRBL_REALTIME_COMMAND,
  GRBL_RESPONSE_KIND,
  GRBL_STATUS_POLL_INTERVAL_MS,
  GRBL_UNLOCK_COMMAND,
} from './grbl.constants';
import { GrblCommandWriter } from './grbl.command.writer';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { newGrblConsoleEntryEvent } from './grbl.console.entry.event';
import { GrblControllerBusyError } from './grbl.controller.busy.error';
import { performGrblHandshake } from './grbl.handshake';
import { newGrblHandshakeContext } from './grbl.handshake.context';
import { GrblLineFramer } from './grbl.line.framer';
import { getPreparedGrblLine } from './grbl.line.preparer';
import { GrblMachineControls } from './grbl.machine.controls';
import { getParsedGrblResponse } from './grbl.response.parser';
import { GrblStatusPoller } from './grbl.status.poller';
import { GrblStatusTracker } from './grbl.status.tracker';
import type { GrblControllerPhase } from './grbl.constants';
import type { GrblConnectionInfo } from './interfaces/GrblConnectionInfo';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblFirmwareIdentity } from './interfaces/GrblFirmwareIdentity';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { GrblResponse } from './interfaces/GrblResponse';
import type { SerialTransport } from './interfaces/SerialTransport';

/** Receives every controller event. */
type GrblControllerEventListener = (event: GrblControllerEvent) => void;

/** Receives every banner while set. */
type GrblBannerListener = (identity: GrblFirmwareIdentity) => void;

/** Cancels the running handshake with the given error. */
type GrblHandshakeCanceller = (error: Error) => void;

/** Developer-facing message for a response kind the controller does not route. */
const getUnknownResponseMessage = (response: never): string => `Unknown GRBL response ${JSON.stringify(response)}`;

/**
 * Drives one GRBL controller over a serial transport: handshake, status polling, console commands, stop, reset and
 * hold controls, response routing and typed events. Writing lives in GrblCommandWriter, the machine controls in
 * GrblMachineControls. Framework-free, so the Redux bridge owns one instance.
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

  public constructor(transport: SerialTransport) {
    this.transport = transport;
    this.commandWriter = new GrblCommandWriter(transport, (event: GrblControllerEvent): void => this.emitEvent(event));
    this.statusPoller = new GrblStatusPoller(
      (): void => void this.commandWriter.writeRealtimeCommand(GRBL_REALTIME_COMMAND.STATUS_QUERY),
    );
    this.machineControls = new GrblMachineControls({
      commandWriter: this.commandWriter,
      statusPoller: this.statusPoller,
      statusTracker: this.statusTracker,
      isConnected: (): boolean => this.phase === GRBL_CONTROLLER_PHASE.CONNECTED,
      addEventListener: (listener: GrblControllerEventListener): (() => void) => this.addEventListener(listener),
      emitEvent: (event: GrblControllerEvent): void => this.emitEvent(event),
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

      return connectionInfo;
    } catch (error: unknown) {
      // A closed connection was already released by whoever closed it, possibly before a new connect() started.
      if (!(error instanceof GrblConnectionClosedError)) {
        this.releaseConnectionState();
      }

      throw error;
    }
  }

  /** Stops polling, drops queued lines and closes the transport. */
  public async disconnect(): Promise<void> {
    const wasTransportOpen: boolean = this.phase !== GRBL_CONTROLLER_PHASE.DISCONNECTED;

    this.releaseConnectionState();

    if (wasTransportOpen) {
      await this.transport.close();
    }
  }

  /**
   * Prepares a typed line and queues it. A line that is empty after preparation is ignored, and so is any line
   * before the handshake is done: the reset would wipe it while it still counted as in flight, so $I's ok would
   * acknowledge it.
   */
  public sendConsoleCommand(commandText: string): void {
    const preparedLine: string | undefined = getPreparedGrblLine(commandText);

    if (!preparedLine) {
      return;
    }

    if (this.phase === GRBL_CONTROLLER_PHASE.CONNECTED) {
      this.commandWriter.enqueueLine(preparedLine, GRBL_LINE_ORIGIN.CONSOLE);
    }
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

  public sendFeedHold(): Promise<void> {
    return this.machineControls.writeConnectedRealtimeCommand(GRBL_REALTIME_COMMAND.FEED_HOLD);
  }

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

  /** Forgets everything tied to the current connection; a running handshake and waiting private commands fail. */
  private releaseConnectionState(): void {
    this.phase = GRBL_CONTROLLER_PHASE.DISCONNECTED;
    this.handshakeCanceller?.(new GrblConnectionClosedError());
    this.machineControls.releaseMachineControls();
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
      this.handleReceivedLine(lineText);
    }
  }

  private handleReceivedLine(lineText: string): void {
    const response: GrblResponse = getParsedGrblResponse(lineText);

    this.emitEvent(newGrblConsoleEntryEvent({
      direction: GRBL_CONSOLE_DIRECTION.RECEIVED,
      text: lineText,
      realtimeCommand: undefined,
      isStatusReport: response.kind === GRBL_RESPONSE_KIND.STATUS,
    }));
    this.routeResponse(response, lineText);
  }

  private routeResponse(response: GrblResponse, lineText: string): void {
    switch (response.kind) {
    case GRBL_RESPONSE_KIND.OK:
      this.commandWriter.acknowledgeOldestLine();
      this.commandWriter.sendQueuedLines();
      break;
    case GRBL_RESPONSE_KIND.ERROR:
      this.handleErrorResponse(response.code);
      break;
    case GRBL_RESPONSE_KIND.ALARM:
      this.emitEvent({ kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM, code: response.code });
      break;
    case GRBL_RESPONSE_KIND.STATUS:
      this.commandWriter.trackStatusReportReceived();
      this.emitEvent({
        kind: GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT,
        status: this.statusTracker.trackStatusReport(response.report),
      });
      break;
    case GRBL_RESPONSE_KIND.BANNER:
      this.bannerListener?.(response.identity);
      this.machineControls.handleReceivedBanner();
      break;
    case GRBL_RESPONSE_KIND.SETTING:
    case GRBL_RESPONSE_KIND.FEEDBACK:
    case GRBL_RESPONSE_KIND.OTHER:
      this.commandWriter.collectAnswerLine(lineText);
      break;
    default: {
      const unknownResponse: never = response;
      throw new Error(getUnknownResponseMessage(unknownResponse));
    }
    }
  }

  /**
   * The error event goes out before more lines are sent, so a listener can still stop the queue. Before the banner
   * after a reset an error belongs to a wiped line, so no event goes out: it would show a misleading error.
   */
  private handleErrorResponse(errorCode: number): void {
    if (this.commandWriter.isQueueHeldForBanner()) {
      return;
    }

    const failedLine: GrblQueuedLine | undefined = this.commandWriter.acknowledgeOldestLine();

    this.emitEvent({
      kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
      code: errorCode,
      lineText: failedLine?.text ?? GRBL_EMPTY_TEXT,
      origin: failedLine?.origin ?? GRBL_LINE_ORIGIN.CONSOLE,
    });
    this.commandWriter.sendQueuedLines();
  }

  private emitEvent(event: GrblControllerEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }
}
