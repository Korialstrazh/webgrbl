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
import type { JobRunKind } from '../job.run.kind.constants';

export interface JobRunStartedPayload {
  /** When the run started, in milliseconds since the epoch. */
  startedAtMs: number;
  /** Whether this run is a job or a frame. */
  kind: JobRunKind;
}
