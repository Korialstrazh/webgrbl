/**
 * How the wait for the end of a job ended.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Action } from '../action';

export interface JobFinishRaceResult {
  /** The machine's verdict: true when it went Idle, false at an alarm; undefined after an interruption. */
  isMachineDone?: boolean;
  /** The stop or reset that came first. */
  interruption?: Action<unknown>;
}
