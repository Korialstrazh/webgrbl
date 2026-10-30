import {
  GRBL_CONSOLE_DIRECTION,
  GRBL_CONTROLLER_EVENT_KIND,
  GRBL_DEFAULT_RX_BUFFER_BYTES,
  GRBL_EMPTY_TEXT,
  GRBL_LINE_ORIGIN,
  GRBL_LINE_TERMINATOR,
  GRBL_REALTIME_COMMAND,
  GRBL_REALTIME_COMMAND_BYTE,
  GRBL_REALTIME_COMMAND_TEXT,
  GRBL_RESPONSE_KIND,
  GRBL_STATUS_POLL_INTERVAL_MS,
} from './grbl.constants';
import { GrblCharacterCountingQueue } from './grbl.character.counting.queue';
import { GrblConnectionClosedError } from './grbl.connection.closed.error';
import { isEepromWritingGrblLine } from './grbl.eeprom.command.detector';
import { performGrblHandshake } from './grbl.handshake';
import { GrblLineFramer } from './grbl.line.framer';
import { getPreparedGrblLine } from './grbl.line.preparer';
import { GrblPrivateCommandRegistry } from './grbl.private.command.registry';
import { getParsedGrblResponse } from './grbl.response.parser';
import { GrblStatusPoller } from './grbl.status.poller';
import { GrblStatusTracker } from './grbl.status.tracker';
import type { GrblLineOrigin, GrblRealtimeCommand } from './grbl.constants';
import type { GrblConnectionInfo } from './interfaces/GrblConnectionInfo';
import type { GrblConsoleEntry } from './interfaces/GrblConsoleEntry';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblFirmwareIdentity } from './interfaces/GrblFirmwareIdentity';
import type { GrblHandshakeContext } from './interfaces/GrblHandshakeContext';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';
import type { GrblResolvedStatus } from './interfaces/GrblResolvedStatus';
import type { GrblResponse } from './interfaces/GrblResponse';
import type { SerialTransport } from './interfaces/SerialTransport';

/** A console entry before the controller stamps its time. */
type GrblUnstampedConsoleEntry = Omit<GrblConsoleEntry, 'timestamp'>;

/** Receives every controller event. */
type GrblControllerEventListener = (event: GrblControllerEvent) => void;

/** Receives every banner while set. */
type GrblBannerListener = (identity: GrblFirmwareIdentity) => void;

/**
 * Drives one GRBL controller over a serial transport: handshake, status polling, the character-counting send queue,
 * private commands, response routing and typed events. Framework-free, so the Redux bridge owns one instance.
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
  /** True from opening the transport until it is closed or lost. */
  private isTransportOpen = false;
  /** Sends the status query at an interval while connected. */
  private readonly statusPoller: GrblStatusPoller = new GrblStatusPoller(
    (): void => this.writeRealtimeCommand(GRBL_REALTIME_COMMAND.STATUS_QUERY),
  );

  public constructor(transport: SerialTransport) {
    this.transport = transport;
    this.transport.setReceiveListener((chunk: Uint8Array): void => this.handleReceivedChunk(chunk));
    this.transport.setConnectionLostListener((): void => this.handleConnectionLost());
  }

  /** Opens the transport and runs the handshake; rejects with GrblHandshakeError when the controller is unusable. */
  public async connect(): Promise<GrblConnectionInfo> {
    this.releaseConnectionState();
    this.statusTracker.clearTrackedStatus();

    try {
      const connectionInfo: GrblConnectionInfo = await performGrblHandshake(this.newHandshakeContext());

      this.sendQueue.setRxBufferSize(connectionInfo.rxBufferSize);
      this.statusPoller.startPolling(GRBL_STATUS_POLL_INTERVAL_MS);

      return connectionInfo;
    } catch (error: unknown) {
      this.releaseConnectionState();
      throw error;
    }
  }

  /** Stops polling, drops queued lines and closes the transport. */
  public async disconnect(): Promise<void> {
    const wasTransportOpen: boolean = this.isTransportOpen;

    this.releaseConnectionState();

    if (wasTransportOpen) {
      await this.transport.close();
    }
  }

  /** Prepares a typed line and queues it; a line that is empty after preparation is ignored. */
  public sendConsoleCommand(commandText: string): void {
    const preparedLine: string | undefined = getPreparedGrblLine(commandText);

    if (!preparedLine) {
      return;
    }

    if (this.isTransportOpen) {
      this.enqueueLine(this.newQueuedLine(preparedLine, GRBL_LINE_ORIGIN.CONSOLE));
    }
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
      openTransport: async (): Promise<void> => {
        this.isTransportOpen = true;
        await this.transport.open();
      },
      closeTransport: async (): Promise<void> => {
        this.isTransportOpen = false;
        await this.transport.close();
      },
      writeRealtimeCommand: (command: GrblRealtimeCommand): void => this.writeRealtimeCommand(command),
      setBannerListener: (listener: GrblBannerListener | undefined): void => {
        this.bannerListener = listener;
      },
      sendPrivateCommand: (commandText: string): Promise<string[]> => this.sendPrivateCommand(commandText),
    };
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
  private writeRealtimeCommand(command: GrblRealtimeCommand): void {
    this.emitConsoleEntry({
      direction: GRBL_CONSOLE_DIRECTION.REALTIME,
      text: GRBL_REALTIME_COMMAND_TEXT[command],
      realtimeCommand: command,
      isStatusReport: command === GRBL_REALTIME_COMMAND.STATUS_QUERY,
    });
    this.writeBytes(Uint8Array.of(GRBL_REALTIME_COMMAND_BYTE[command]));
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

  /** Forgets everything tied to the current connection; waiting private commands fail. */
  private releaseConnectionState(): void {
    this.isTransportOpen = false;
    this.statusPoller.stopPolling();
    this.sendQueue.clearAllLines();
    this.lineFramer.reset();
    this.privateCommands.rejectAllPrivateLines(new GrblConnectionClosedError());
  }

  private handleConnectionLost(): void {
    if (!this.isTransportOpen) {
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
      break;
    case GRBL_RESPONSE_KIND.SETTING:
    case GRBL_RESPONSE_KIND.FEEDBACK:
    case GRBL_RESPONSE_KIND.OTHER:
      this.privateCommands.collectAnswerLine(this.sendQueue.getOldestInFlightLine(), lineText);
      break;
    default: {
      const unknownResponse: never = response;
      throw new Error(`Unknown GRBL response ${JSON.stringify(unknownResponse)}`);
    }
    }
  }

  /** Frees the oldest in-flight line and settles it if it was a private line; returns that line. */
  private acknowledgeOldestLine(): GrblQueuedLine | undefined {
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
