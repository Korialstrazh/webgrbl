import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';

/** Bytes the line break adds to every sent line. */
const LINE_BREAK_BYTE_COUNT = 1;

/**
 * Releases lines only while the controller receive buffer has room for them, so the buffer never overruns.
 * A line that writes to EEPROM is sent alone.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblCharacterCountingQueue {
  /** Size of the controller receive buffer in bytes. */
  private rxBufferSize: number;
  /** Lines not sent yet, oldest first. */
  private pendingLines: GrblQueuedLine[] = [];
  /** Index of the oldest pending line; avoids the linear cost of removing from the array front. */
  private pendingHeadIndex = 0;
  /** Lines sent and not yet acknowledged, oldest first. */
  private inFlightLines: GrblQueuedLine[] = [];
  /** Bytes the in-flight lines occupy in the controller receive buffer. */
  private inFlightByteCount = 0;

  /** @param rxBufferSize Size of the controller receive buffer in bytes. */
  public constructor(rxBufferSize: number) {
    this.rxBufferSize = rxBufferSize;
  }

  /** Changes the receive buffer size used for later send decisions; lines already in flight are unaffected. */
  public setRxBufferSize(rxBufferSize: number): void {
    this.rxBufferSize = rxBufferSize;
  }

  /** Appends lines to the end of the pending lines. */
  public enqueueLines(lines: GrblQueuedLine[]): void {
    for (const line of lines) {
      this.pendingLines.push(line);
    }
  }

  /** Moves every pending line that fits the receive buffer into the in-flight lines and returns them in send order. */
  public takeSendableLines(): GrblQueuedLine[] {
    const sendableLines: GrblQueuedLine[] = [];

    while (!this.hasEepromLineInFlight()) {
      const nextLine: GrblQueuedLine | undefined = this.pendingLines[this.pendingHeadIndex];

      if (!nextLine || !this.canSendLine(nextLine)) {
        break;
      }

      this.pendingHeadIndex++;
      this.inFlightLines.push(nextLine);
      this.inFlightByteCount += this.getLineByteCount(nextLine);
      sendableLines.push(nextLine);
    }

    if (!this.hasPendingLines()) {
      this.pendingLines = [];
      this.pendingHeadIndex = 0;
    }

    return sendableLines;
  }

  /** Removes the oldest in-flight line, freeing its buffer bytes; returns undefined when nothing is in flight. */
  public acknowledgeOldestInFlightLine(): GrblQueuedLine | undefined {
    const acknowledgedLine: GrblQueuedLine | undefined = this.inFlightLines.shift();

    if (acknowledgedLine) {
      this.inFlightByteCount -= this.getLineByteCount(acknowledgedLine);
    }

    return acknowledgedLine;
  }

  /** Drops all pending and in-flight lines. */
  public clearAllLines(): void {
    this.pendingLines = [];
    this.pendingHeadIndex = 0;
    this.inFlightLines = [];
    this.inFlightByteCount = 0;
  }

  /** True while at least one sent line is not acknowledged yet. */
  public hasInFlightLines(): boolean {
    return this.inFlightLines.length > 0;
  }

  /** True while at least one line is waiting to be sent. */
  public hasPendingLines(): boolean {
    return this.pendingHeadIndex < this.pendingLines.length;
  }

  private getLineByteCount(line: GrblQueuedLine): number {
    return line.text.length + LINE_BREAK_BYTE_COUNT;
  }

  private hasEepromLineInFlight(): boolean {
    return this.inFlightLines.some((line: GrblQueuedLine) => line.isEepromWrite);
  }

  /** An empty buffer always accepts a line, even a longer one, so the queue cannot deadlock. */
  private canSendLine(line: GrblQueuedLine): boolean {
    if (!this.hasInFlightLines()) {
      return true;
    }

    if (line.isEepromWrite) {
      return false;
    }

    return this.inFlightByteCount + this.getLineByteCount(line) <= this.rxBufferSize;
  }
}
