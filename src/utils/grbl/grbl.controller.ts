import {
  GRBL_CONSOLE_DIRECTION,
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_CONTROLLER_PHASE,
  GRBL_DEFAULT_RX_BUFFER_BYTES,
  GRBL_EMPTY_TEXT,
  GRBL_LINE_ORIGIN,
  GRBL_LINE_TERMINATOR,
  GRBL_REALTIME_COMMAND,
  GRBL_REALTIME_COMMAND_BYTE,
  GRBL_REALTIME_COMMAND_TEXT,
  GRBL_RESPONSE_KIND,
  GRBL_STATUS_POLL_INTERVAL_MS,
  GRBL_UNLOCK_COMMAND,
} from './grbl.constants';
import { GrblCharacterCountingQueue } from './grbl.character.counting.queue';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { GrblControllerBusyError } from './grbl.controller.busy.error';
import { isEepromWritingGrblLine } from './grbl.eeprom.command.detector';
import { performGrblHandshake } from './grbl.handshake';
import { GrblLineFramer } from './grbl.line.framer';
import { getPreparedGrblLine } from './grbl.line.preparer';
import { GrblPrivateCommandRegistry } from './grbl.private.command.registry';
import { getParsedGrblResponse } from './grbl.response.parser';
import { GrblStatusPoller } from './grbl.status.poller';
import { GrblStatusTracker } from './grbl.status.tracker';
import { runGrblStopSequence } from './grbl.stop.sequence';
import type { GrblControllerPhase, GrblLineOrigin, GrblRealtimeCommand } from './grbl.constants';
import type { GrblConnectionInfo } from './interfaces/GrblConnectionInfo';
import type { GrblConsoleEntry } from './interfaces/GrblConsoleEntry';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblFirmwareIdentity } from './interfaces/GrblFirmwareIdentity';
import type { GrblHandshakeContext } from './interfaces/GrblHandshakeContext';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { GrblResponse } from './interfaces/GrblResponse';
import type { GrblStopSequenceContext } from './interfaces/GrblStopSequenceContext';
import type { SerialTransport } from './interfaces/SerialTransport';

/** A console entry before the controller stamps its time. */
type GrblUnstampedConsoleEntry = Omit<GrblConsoleEntry, 'timestamp'>;

/** Receives every controller event. */
type GrblControllerEventListener = (event: GrblControllerEvent) => void;

/** Receives every banner while set. */
type GrblBannerListener = (identity: GrblFirmwareIdentity) => void;

/** Cancels the running handshake with the given error. */
type GrblHandshakeCanceller = (error: Error) => void;

/** Ends the hold wait of a running stop at once. */
type GrblHoldWaitCanceller = () => void;

/** Developer-facing message for a response kind the controller does not route. */
const getUnknownResponseMessage = (response: never): string => `Unknown GRBL response ${JSON.stringify(response)}`;

/**
 * Drives one GRBL controller over a serial transport: handshake, status polling, the character-counting send queue,
 * private commands, stop, reset and hold controls, response routing and typed events. Framework-free, so the Redux
 * bridge owns one instance.
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
  /** Lines waiting for and occupying the controller receive buffer. */
  private readonly sendQueue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(GRBL_DEFAULT_RX_BUFFER_BYTES);
  /** Private lines waiting for their answer. */
  private readonly privateCommands: GrblPrivateCommandRegistry = new GrblPrivateCommandRegistry();
  /** Encodes sent lines into bytes. */
  private readonly lineEncoder: TextEncoder = new TextEncoder();
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
  /** Sends the status query at an interval while connected. */
  private readonly statusPoller: GrblStatusPoller = new GrblStatusPoller(
    (): void => void this.writeRealtimeCommand(GRBL_REALTIME_COMMAND.STATUS_QUERY),
  );

  /** The stop sequence in progress; a second stop request shares it. */
  private runningStop: Promise<void> | undefined;
  /** Ends the hold wait of the running stop; set only while it waits. */
  private holdWaitCanceller: GrblHoldWaitCanceller | undefined;
  /**
   * True from a soft reset until the controller prints its banner again: answers arriving meanwhile belong to lines
   * the reset wiped, and lines sent meanwhile could be wiped as well, so the queue holds them back.
   */
  private isAwaitingResetBanner = false;

  public constructor(transport: SerialTransport) {
    this.transport = transport;
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
      const connectionInfo: GrblConnectionInfo = await performGrblHandshake(this.newHandshakeContext());

      this.sendQueue.setRxBufferSize(connectionInfo.rxBufferSize);
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
      this.enqueueLine(this.newQueuedLine(preparedLine, GRBL_LINE_ORIGIN.CONSOLE));
    }
  }

  /**
   * Stops the machine as fast as possible without losing its position (see runGrblStopSequence). Resolves once the
   * reset byte is written; a stop requested while one runs returns the running stop.
   */
  public stopMachine(): Promise<void> {
    if (this.phase !== GRBL_CONTROLLER_PHASE.CONNECTED) {
      return Promise.resolve();
    }

    this.runningStop ??= this.runStopSequence();

    return this.runningStop;
  }

  /** Writes the soft reset at once and drops all queued and in-flight lines. */
  public async resetMachine(): Promise<void> {
    if (this.phase !== GRBL_CONTROLLER_PHASE.CONNECTED) {
      return;
    }

    this.sendQueue.clearAllLines();
    this.isAwaitingResetBanner = true;
    await this.writeRealtimeCommand(GRBL_REALTIME_COMMAND.SOFT_RESET);
  }

  /** Queues $X, which clears the Alarm lock, as a console line. */
  public unlockMachine(): void {
    this.sendConsoleCommand(GRBL_UNLOCK_COMMAND);
  }

  public sendFeedHold(): Promise<void> {
    return this.writeConnectedRealtimeCommand(GRBL_REALTIME_COMMAND.FEED_HOLD);
  }

  public sendCycleResume(): Promise<void> {
    return this.writeConnectedRealtimeCommand(GRBL_REALTIME_COMMAND.CYCLE_RESUME);
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

  private newHandshakeContext(): GrblHandshakeContext {
    return {
      openTransport: (): Promise<void> => this.transport.open(),
      closeTransport: (): Promise<void> => this.transport.close(),
      writeRealtimeCommand: (command: GrblRealtimeCommand): void => void this.writeRealtimeCommand(command),
      setBannerListener: (listener: GrblBannerListener | undefined): void => {
        this.bannerListener = listener;
      },
      setHandshakeCanceller: (canceller: GrblHandshakeCanceller | undefined): void => {
        this.handshakeCanceller = canceller;
      },
      sendPrivateCommand: (commandText: string): Promise<string[]> => this.sendPrivateCommand(commandText),
    };
  }

  private newStopSequenceContext(): GrblStopSequenceContext {
    return {
      clearPendingLines: (): void => this.sendQueue.clearPendingLines(),
      getLatestStatus: (): GrblResolvedStatus | undefined => this.statusTracker.getLatestStatus(),
      writeRealtimeCommand: (command: GrblRealtimeCommand): void => void this.writeRealtimeCommand(command),
      setStatusPollInterval: (intervalMs: number): void => {
        if (this.phase === GRBL_CONTROLLER_PHASE.CONNECTED) {
          this.statusPoller.startPolling(intervalMs);
        }
      },
      addEventListener: (listener: GrblControllerEventListener): (() => void) => this.addEventListener(listener),
      setHoldWaitCanceller: (canceller: GrblHoldWaitCanceller | undefined): void => {
        this.holdWaitCanceller = canceller;
      },
      resetMachine: (): Promise<void> => this.resetMachine(),
    };
  }

  private async runStopSequence(): Promise<void> {
    try {
      await runGrblStopSequence(this.newStopSequenceContext());
    } finally {
      this.runningStop = undefined;
    }
  }

  private async writeConnectedRealtimeCommand(command: GrblRealtimeCommand): Promise<void> {
    if (this.phase === GRBL_CONTROLLER_PHASE.CONNECTED) {
      await this.writeRealtimeCommand(command);
    }
  }

  private newQueuedLine(text: string, origin: GrblLineOrigin): GrblQueuedLine {
    return { text, isEepromWrite: isEepromWritingGrblLine(text), origin, programLineNumber: undefined };
  }

  private sendPrivateCommand(commandText: string): Promise<string[]> {
    const line: GrblQueuedLine = this.newQueuedLine(commandText, GRBL_LINE_ORIGIN.PRIVATE);
    const answer: Promise<string[]> = this.privateCommands.registerPrivateLine(line);

    this.enqueueLine(line);

    return answer;
  }

  private enqueueLine(line: GrblQueuedLine): void {
    this.sendQueue.enqueueLines([line]);
    this.sendQueuedLines();
  }

  /** Writes every queued line the controller receive buffer has room for. */
  private sendQueuedLines(): void {
    if (this.isAwaitingResetBanner) {
      return;
    }

    for (const line of this.sendQueue.takeSendableLines()) {
      this.emitConsoleEntry({
        direction: GRBL_CONSOLE_DIRECTION.SENT,
        text: line.text,
        realtimeCommand: undefined,
        isStatusReport: false,
      });
      this.writeBytes(this.lineEncoder.encode(`${line.text}${GRBL_LINE_TERMINATOR}`));
    }
  }

  /** Realtime bytes skip the send queue, so they reach the controller even when its buffer is full. */
  private writeRealtimeCommand(command: GrblRealtimeCommand): Promise<void> {
    this.emitConsoleEntry({
      direction: GRBL_CONSOLE_DIRECTION.REALTIME,
      text: GRBL_REALTIME_COMMAND_TEXT[command],
      realtimeCommand: command,
      isStatusReport: command === GRBL_REALTIME_COMMAND.STATUS_QUERY,
    });

    return this.writeBytesToTransport(Uint8Array.of(GRBL_REALTIME_COMMAND_BYTE[command]));
  }

  private writeBytes(bytes: Uint8Array): void {
    void this.writeBytesToTransport(bytes);
  }

  private async writeBytesToTransport(bytes: Uint8Array): Promise<void> {
    try {
      await this.transport.write(bytes);
    } catch {
      // A failed write means the port is gone; the transport reports that through its connection-lost listener.
    }
  }

  /** Forgets everything tied to the current connection; a running handshake and waiting private commands fail. */
  private releaseConnectionState(): void {
    this.phase = GRBL_CONTROLLER_PHASE.DISCONNECTED;
    this.isAwaitingResetBanner = false;
    this.handshakeCanceller?.(new GrblConnectionClosedError());
    this.holdWaitCanceller?.();
    this.statusPoller.stopPolling();
    this.sendQueue.clearAllLines();
    this.lineFramer.reset();
    this.privateCommands.rejectAllPrivateLines(new GrblConnectionClosedError());
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

    this.emitConsoleEntry({
      direction: GRBL_CONSOLE_DIRECTION.RECEIVED,
      text: lineText,
      realtimeCommand: undefined,
      isStatusReport: response.kind === GRBL_RESPONSE_KIND.STATUS,
    });
    this.routeResponse(response, lineText);
  }

  private routeResponse(response: GrblResponse, lineText: string): void {
    switch (response.kind) {
    case GRBL_RESPONSE_KIND.OK:
      this.acknowledgeOldestLine();
      this.sendQueuedLines();
      break;
    case GRBL_RESPONSE_KIND.ERROR:
      this.handleErrorResponse(response.code);
      break;
    case GRBL_RESPONSE_KIND.ALARM:
      this.emitEvent({ kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ALARM, code: response.code });
      break;
    case GRBL_RESPONSE_KIND.STATUS:
      this.emitEvent({
        kind: GRBL_CONTROLLER_EVENT_KIND.STATUS_REPORT,
        status: this.statusTracker.trackStatusReport(response.report),
      });
      break;
    case GRBL_RESPONSE_KIND.BANNER:
      this.bannerListener?.(response.identity);
      this.handleResetBanner();
      break;
    case GRBL_RESPONSE_KIND.SETTING:
    case GRBL_RESPONSE_KIND.FEEDBACK:
    case GRBL_RESPONSE_KIND.OTHER:
      this.privateCommands.collectAnswerLine(this.sendQueue.getOldestInFlightLine(), lineText);
      break;
    default: {
      const unknownResponse: never = response;
      throw new Error(getUnknownResponseMessage(unknownResponse));
    }
    }
  }

  private handleResetBanner(): void {
    if (this.isAwaitingResetBanner) {
      this.isAwaitingResetBanner = false;
      this.sendQueuedLines();
    }
  }

  /**
   * Frees the oldest in-flight line and settles it if it was a private line; returns that line. Before the banner
   * after a reset, an answer belongs to a wiped line and frees nothing.
   */
  private acknowledgeOldestLine(): GrblQueuedLine | undefined {
    if (this.isAwaitingResetBanner) {
      return undefined;
    }

    const acknowledgedLine: GrblQueuedLine | undefined = this.sendQueue.acknowledgeOldestInFlightLine();

    this.privateCommands.completePrivateLine(acknowledgedLine);

    return acknowledgedLine;
  }

  /** The error event goes out before more lines are sent, so a listener can still stop the queue. */
  private handleErrorResponse(errorCode: number): void {
    const failedLine: GrblQueuedLine | undefined = this.acknowledgeOldestLine();

    this.emitEvent({
      kind: GRBL_CONTROLLER_EVENT_KIND.GRBL_ERROR,
      code: errorCode,
      lineText: failedLine?.text ?? GRBL_EMPTY_TEXT,
      origin: failedLine?.origin ?? GRBL_LINE_ORIGIN.CONSOLE,
    });
    this.sendQueuedLines();
  }

  private emitConsoleEntry(unstampedEntry: GrblUnstampedConsoleEntry): void {
    this.emitEvent({
      kind: GRBL_CONTROLLER_EVENT_KIND.CONSOLE_ENTRY,
      entry: { ...unstampedEntry, timestamp: Date.now() },
    });
  }

  private emitEvent(event: GrblControllerEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }
}
