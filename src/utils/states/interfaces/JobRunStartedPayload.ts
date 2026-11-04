/**
 * What the JobRunStarted action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface JobRunStartedPayload {
  /** When the run started, in milliseconds since the epoch. */
  startedAtMs: number;
}
