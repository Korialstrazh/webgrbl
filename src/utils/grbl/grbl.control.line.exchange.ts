import type { GrblControlLineWait } from './interfaces/GrblControlLineWait';
import type { GrblProgramStreamerHost } from './interfaces/GrblProgramStreamerHost';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';
import { GRBL_LINE_ORIGIN } from './grbl.constants';

/** True when GRBL resets itself after this answer: the line expects a reset and was answered ok. */
const isResetFollowingControlLineAnswer = (
  wait: GrblControlLineWait | undefined,
  errorCode: number | undefined,
): boolean => !errorCode && !!wait?.isFollowedByReset;

/**
 * Sends the lines the program streamer needs for itself (the $C of check mode), tracks the answer to the line in
 * flight and the wait for the reset banner GRBL prints when it leaves check mode.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblControlLineExchange {
  /** The controller parts the exchange acts on. */
  private readonly host: Pick<GrblProgramStreamerHost, 'commandWriter' | 'holdQueueUntilCheckModeBanner'>;
  /** The $C line of check mode waiting for its answer. */
  private controlLineWait: GrblControlLineWait | undefined;
  /** True from the ok of the $C that leaves check mode until the queue stops waiting for the reset banner. */
  private isResetBannerAwaited = false;
  /** Resolves the wait for the reset banner; set only while someone waits. */
  private resolveResetBannerWait: (() => void) | undefined;

  public constructor(host: Pick<GrblProgramStreamerHost, 'commandWriter' | 'holdQueueUntilCheckModeBanner'>) {
    this.host = host;
  }

  /** Queues the control line and resolves with the GRBL error code of its answer, or undefined for ok. */
  public sendControlLine(commandText: string, isFollowedByReset: boolean): Promise<number | undefined> {
    const line: GrblQueuedLine = {
      text: commandText,
      isSentAlone: isFollowedByReset,
      origin: GRBL_LINE_ORIGIN.PROGRAM,
      programLineNumber: undefined,
    };

    return new Promise(
      (resolveAnswer: (errorCode: number | undefined) => void, rejectAnswer: (error: Error) => void): void => {
        this.controlLineWait = { line, isFollowedByReset, resolveAnswer, rejectAnswer };
        this.host.commandWriter.enqueueLines([line]);
      },
    );
  }

  /**
   * Settles the wait when the answered line is the control line in flight and returns true; returns false for any
   * other line. The hold for the reset banner starts before the router sends more lines, so none of them is wiped.
   */
  public settleIfControlLine(line: GrblQueuedLine, errorCode: number | undefined): boolean {
    if (line !== this.controlLineWait?.line) {
      return false;
    }

    const wait: GrblControlLineWait = this.controlLineWait;

    this.controlLineWait = undefined;

    if (isResetFollowingControlLineAnswer(wait, errorCode)) {
      this.isResetBannerAwaited = true;
      this.host.holdQueueUntilCheckModeBanner();
    }

    wait.resolveAnswer(errorCode);

    return true;
  }

  /** Rejects the control line wait, if any, because the line can no longer be answered. */
  public failControlLineWait(error: Error): void {
    this.controlLineWait?.rejectAnswer(error);
    this.controlLineWait = undefined;
  }

  /** Resolves at once unless the reset banner is awaited. */
  public waitForResetBanner(): Promise<void> {
    if (!this.isResetBannerAwaited) {
      return Promise.resolve();
    }

    return new Promise((resolveWait: () => void): void => {
      this.resolveResetBannerWait = resolveWait;
    });
  }

  /** Ends the wait for the reset banner, for the banner itself, its timeout or a closed connection. */
  public handleBannerWaitEnded(): void {
    this.isResetBannerAwaited = false;
    this.resolveResetBannerWait?.();
    this.resolveResetBannerWait = undefined;
  }
}
