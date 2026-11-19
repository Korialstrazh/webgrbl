/**
 * What the JobRunStarted action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobRunKind } from '../job.run.kind.constants';

export interface JobRunStartedPayload {
  /** When the run started, in milliseconds since the epoch. */
  startedAtMs: number;
  /** Whether this run is a job or a frame. */
  kind: JobRunKind;
}
