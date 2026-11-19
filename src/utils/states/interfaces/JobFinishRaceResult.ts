/**
 * How the wait for the end of a job ended.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Action } from '../action';

export interface JobFinishRaceResult {
  /** The machine's verdict: true when it went Idle, false at an alarm; undefined after an interruption. */
  isMachineDone?: boolean;
  /** The stop or reset that came first. */
  interruption?: Action<unknown>;
}
