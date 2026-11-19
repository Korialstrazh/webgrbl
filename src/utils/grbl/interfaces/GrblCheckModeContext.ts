/**
 * What the check mode run needs from the program streamer it runs in.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblProgramResult } from './GrblProgramResult';

export interface GrblCheckModeContext {
  /**
   * Queues a line of the check itself and resolves with the GRBL error code it was answered with, or undefined for
   * ok. A line followed by a reset is sent alone and holds the queue until the reset's banner. Rejects when a reset,
   * an alarm or a closed connection means the line can no longer be answered.
   */
  sendControlLine(commandText: string, isFollowedByReset: boolean): Promise<number | undefined>;
  /** Streams the program lines with stop-on-error off; their errors are results and raise no grbl-error event. */
  streamCheckedLines(programLines: string[]): Promise<GrblProgramResult>;
  /** Resolves once no reset banner is awaited any more (it arrived, the wait timed out, or the connection closed). */
  waitForResetBanner(): Promise<void>;
  /** The error for a check that a reset, an alarm or a closed connection ended early. */
  getInterruptionError(): Error;
}
