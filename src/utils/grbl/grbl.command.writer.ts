import {
  GRBL_CONSOLE_DIRECTION,
  GRBL_DEFAULT_RX_BUFFER_BYTES,
  GRBL_LINE_ORIGIN,
  GRBL_LINE_TERMINATOR,
  GRBL_REALTIME_COMMAND,
  GRBL_REALTIME_COMMAND_BYTE,
  GRBL_REALTIME_COMMAND_TEXT,
} from './grbl.constants';
import { GrblCharacterCountingQueue } from './grbl.character.counting.queue';
import { GrblCommandWipedError } from './grbl.command.wiped.error';
import { newGrblConsoleEntryEvent } from './grbl.console.entry.event';
import { isEepromWritingGrblLine } from './grbl.eeprom.command.detector';
import { GrblPrivateCommandRegistry } from './grbl.private.command.registry';
import type { GrblLineOrigin, GrblRealtimeCommand } from './grbl.constants';
import type { GrblControllerEvent } from './interfaces/GrblControllerEvent';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';
import type { SerialTransport } from './interfaces/SerialTransport';

/**
 * Everything the controller writes: queued lines through the character-counting queue, private lines with their
 * answers, and realtime bytes straight to the transport. Each write is emitted as a console entry.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblCommandWriter {
  /** The byte pipe to the controller. */
  private readonly transport: SerialTransport;
  /** Tells the controller's listeners about written console entries. */
  private readonly emitEvent: (event: GrblControllerEvent) => void;
  /** Lines waiting for and occupying the controller receive buffer. */
  private readonly sendQueue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(GRBL_DEFAULT_RX_BUFFER_BYTES);
  /** Private lines waiting for their answer. */
  private readonly privateCommands: GrblPrivateCommandRegistry = new GrblPrivateCommandRegistry();
  /** Encodes sent lines into bytes. */
  private readonly lineEncoder: TextEncoder = new TextEncoder();
  /** Status queries written whose report has not arrived yet. */
  private unansweredStatusQueryCount = 0;

  public constructor(transport: SerialTransport, emitEvent: (event: GrblControllerEvent) => void) {
    this.transport = transport;
    this.emitEvent = emitEvent;
  }

  public setRxBufferSize(rxBufferSize: number): void {
    this.sendQueue.setRxBufferSize(rxBufferSize);
  }

  /** Queues one prepared line and sends whatever fits. */
  public enqueueLine(text: string, origin: GrblLineOrigin): void {
    this.enqueueLines([this.newQueuedLine(text, origin)]);
  }

  /** Queues ready-made lines, such as a whole program, and sends whatever fits. */
  public enqueueLines(lines: GrblQueuedLine[]): void {
    this.sendQueue.enqueueLines(lines);
    this.sendQueuedLines();
  }

  /** Queues a private line; resolves with the lines GRBL printed before acknowledging it. */
  public sendPrivateCommand(commandText: string): Promise<string[]> {
    const line: GrblQueuedLine = this.newQueuedLine(commandText, GRBL_LINE_ORIGIN.PRIVATE);
    const answer: Promise<string[]> = this.privateCommands.registerPrivateLine(line);

    this.enqueueLines([line]);

    return answer;
  }

  /** Writes every queued line the controller receive buffer has room for. */
  public sendQueuedLines(): void {
    for (const line of this.sendQueue.takeSendableLines()) {
      this.emitEvent(newGrblConsoleEntryEvent({
        direction: GRBL_CONSOLE_DIRECTION.SENT,
        text: line.text,
        realtimeCommand: undefined,
        isStatusReport: false,
      }));
      void this.writeBytesToTransport(this.lineEncoder.encode(`${line.text}${GRBL_LINE_TERMINATOR}`));
    }
  }

  /**
   * Realtime bytes skip the send queue, so they reach the controller even when its buffer is full. A soft reset
   * forgets unanswered status queries, so their count cannot grow without bound.
   */
  public writeRealtimeCommand(command: GrblRealtimeCommand): Promise<void> {
    if (command === GRBL_REALTIME_COMMAND.STATUS_QUERY) {
      this.unansweredStatusQueryCount++;
    } else if (command === GRBL_REALTIME_COMMAND.SOFT_RESET) {
      this.unansweredStatusQueryCount = 0;
    }

    this.emitEvent(newGrblConsoleEntryEvent({
      direction: GRBL_CONSOLE_DIRECTION.REALTIME,
      text: GRBL_REALTIME_COMMAND_TEXT[command],
      realtimeCommand: command,
      isStatusReport: command === GRBL_REALTIME_COMMAND.STATUS_QUERY,
    }));

    return this.writeBytesToTransport(Uint8Array.of(GRBL_REALTIME_COMMAND_BYTE[command]));
  }

  /** Frees the oldest in-flight line and settles it if it was a private line; returns that line. */
  public acknowledgeOldestLine(): GrblQueuedLine | undefined {
    const acknowledgedLine: GrblQueuedLine | undefined = this.sendQueue.acknowledgeOldestInFlightLine();

    this.privateCommands.completePrivateLine(acknowledgedLine);

    return acknowledgedLine;
  }

  /** Adds a setting, feedback or other line to the private line it answers, if the oldest in-flight line is one. */
  public collectAnswerLine(lineText: string): void {
    this.privateCommands.collectAnswerLine(this.sendQueue.getOldestInFlightLine(), lineText);
  }

  public clearPendingLines(): void {
    this.sendQueue.clearPendingLines();
  }

  /**
   * For a soft reset: drops every line and holds the queue until the reset's banner. Waiting private lines fail, as
   * the reset wiped them before they were answered.
   */
  public holdQueueUntilBanner(): void {
    this.sendQueue.holdUntilBanner();
    this.privateCommands.rejectAllPrivateLines(new GrblCommandWipedError());
  }

  /** For a controller that resets itself after the line just answered: holds the queue until its banner. */
  public holdQueueUntilBannerKeepingLines(): void {
    this.sendQueue.holdUntilBannerKeepingLines();
  }

  /** For an alarm, which flushes the controller receive buffer: drops every line and fails waiting private lines. */
  public dropAllLines(): void {
    this.sendQueue.dropAllLines();
    this.privateCommands.rejectAllPrivateLines(new GrblCommandWipedError());
  }

  /** Counts a received banner and sends what the queue holds once no banner is expected any more. */
  public releaseQueueAfterBanner(): void {
    this.sendQueue.releaseAfterBanner();
    this.sendQueuedLines();
  }

  /** Stops waiting for banners and sends what the queue holds. */
  public releaseQueueBannerHold(): void {
    this.sendQueue.releaseBannerHold();
    this.sendQueuedLines();
  }

  public isQueueHeldForBanner(): boolean {
    return this.sendQueue.isHeldForBanner();
  }

  public hasInFlightLines(): boolean {
    return this.sendQueue.hasInFlightLines();
  }

  public trackStatusReportReceived(): void {
    this.unansweredStatusQueryCount = Math.max(0, this.unansweredStatusQueryCount - 1);
  }

  public getUnansweredStatusQueryCount(): number {
    return this.unansweredStatusQueryCount;
  }

  /** Drops every line and fails waiting private lines with the given error, for a closed connection. */
  public releaseAllLines(error: Error): void {
    this.sendQueue.clearAllLines();
    this.privateCommands.rejectAllPrivateLines(error);
    this.unansweredStatusQueryCount = 0;
  }

  private newQueuedLine(text: string, origin: GrblLineOrigin): GrblQueuedLine {
    return { text, isSentAlone: isEepromWritingGrblLine(text), origin, programLineNumber: undefined };
  }

  private async writeBytesToTransport(bytes: Uint8Array): Promise<void> {
    try {
      await this.transport.write(bytes);
    } catch {
      // A failed write means the port is gone; the transport reports that through its connection-lost listener.
    }
  }
}
