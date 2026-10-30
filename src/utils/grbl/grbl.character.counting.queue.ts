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
  /** Lines sent and not yet acknowledged, oldest first. */
  private inFlightLines: GrblQueuedLine[] = [];
  /** Bytes the in-flight lines occupy in the controller receive buffer. */
  private inFlightByteCount = 0;

  public constructor(rxBufferSize: number) {
    this.rxBufferSize = rxBufferSize;
  }

  public setRxBufferSize(rxBufferSize: number): void {
    this.rxBufferSize = rxBufferSize;
  }

  public enqueueLines(lines: GrblQueuedLine[]): void {
    this.pendingLines.push(...lines);
  }

  public takeSendableLines(): GrblQueuedLine[] {
    const sendableLines: GrblQueuedLine[] = [];

    while (!this.hasEepromLineInFlight()) {
      const nextLine: GrblQueuedLine | undefined = this.pendingLines[0];

      if (!nextLine || !this.canSendLine(nextLine)) {
        break;
      }

      this.pendingLines.shift();
      this.inFlightLines.push(nextLine);
      this.inFlightByteCount += this.getLineByteCount(nextLine);
      sendableLines.push(nextLine);
    }

    return sendableLines;
  }

  public acknowledgeOldestInFlightLine(): GrblQueuedLine | undefined {
    const acknowledgedLine: GrblQueuedLine | undefined = this.inFlightLines.shift();

    if (acknowledgedLine) {
      this.inFlightByteCount -= this.getLineByteCount(acknowledgedLine);
    }

    return acknowledgedLine;
  }

  public clearAllLines(): void {
    this.pendingLines = [];
    this.inFlightLines = [];
    this.inFlightByteCount = 0;
  }

  public hasInFlightLines(): boolean {
    return this.inFlightLines.length > 0;
  }

  public hasPendingLines(): boolean {
    return this.pendingLines.length > 0;
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
