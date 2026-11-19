import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';

/** Bytes the line break adds to every sent line. */
const LINE_BREAK_BYTE_COUNT = 1;

/**
 * Releases lines only while the controller receive buffer has room for them, so the buffer never overruns.
 * A line marked to be sent alone (an EEPROM write) waits for an empty buffer and nothing follows it until answered.
 * After a soft reset the queue is held until the controller prints its banner again: answers arriving meanwhile
 * belong to lines the reset wiped, and lines sent meanwhile could be wiped as well while still counting as in flight.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
  /** Banners still expected from soft resets; the queue is held while this is above zero. */
  private expectedBannerCount = 0;

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

    while (this.canSendMoreLines()) {
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

  /**
   * Removes the oldest in-flight line, freeing its buffer bytes; returns undefined when nothing is in flight or the
   * queue is held for a banner (the answer then belongs to a wiped line).
   */
  public acknowledgeOldestInFlightLine(): GrblQueuedLine | undefined {
    if (this.isHeldForBanner()) {
      return undefined;
    }

    const acknowledgedLine: GrblQueuedLine | undefined = this.inFlightLines.shift();

    if (acknowledgedLine) {
      this.inFlightByteCount -= this.getLineByteCount(acknowledgedLine);
    }

    return acknowledgedLine;
  }

  /** The sent line the next ok or error answers; undefined when nothing is in flight. */
  public getOldestInFlightLine(): GrblQueuedLine | undefined {
    return this.inFlightLines[0];
  }

  /** Drops the lines not sent yet; in-flight lines stay counted until the controller answers or is reset. */
  public clearPendingLines(): void {
    this.pendingLines = [];
    this.pendingHeadIndex = 0;
  }

  /** Drops all pending and in-flight lines and forgets any banner hold, for a closed connection. */
  public clearAllLines(): void {
    this.dropAllLines();
    this.expectedBannerCount = 0;
  }

  /** Drops all pending and in-flight lines but keeps a banner hold, for an alarm that flushed the controller. */
  public dropAllLines(): void {
    this.clearPendingLines();
    this.inFlightLines = [];
    this.inFlightByteCount = 0;
  }

  /**
   * Holds the queue until one more banner arrives without dropping any line, for a controller that resets itself
   * after the line just answered (leaving check mode). Only safe while nothing is in flight.
   */
  public holdUntilBannerKeepingLines(): void {
    this.expectedBannerCount++;
  }

  /**
   * For a soft reset: drops all pending and in-flight lines and holds the queue until the reset's banner arrives.
   * Each reset prints its own banner, so a second reset keeps the queue held until the second banner.
   */
  public holdUntilBanner(): void {
    this.dropAllLines();
    this.expectedBannerCount++;
  }

  /** Counts one received banner; the queue sends again once every expected banner has arrived. */
  public releaseAfterBanner(): void {
    this.expectedBannerCount = Math.max(0, this.expectedBannerCount - 1);
  }

  /** Gives up waiting for banners, for a controller that never printed one. */
  public releaseBannerHold(): void {
    this.expectedBannerCount = 0;
  }

  public isHeldForBanner(): boolean {
    return this.expectedBannerCount > 0;
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

  private canSendMoreLines(): boolean {
    return !this.isHeldForBanner() && !this.hasSentAloneLineInFlight();
  }

  private hasSentAloneLineInFlight(): boolean {
    return this.inFlightLines.some((line: GrblQueuedLine) => line.isSentAlone);
  }

  /** An empty buffer always accepts a line, even a longer one, so the queue cannot deadlock. */
  private canSendLine(line: GrblQueuedLine): boolean {
    if (!this.hasInFlightLines()) {
      return true;
    }

    if (line.isSentAlone) {
      return false;
    }

    return this.inFlightByteCount + this.getLineByteCount(line) <= this.rxBufferSize;
  }
}
