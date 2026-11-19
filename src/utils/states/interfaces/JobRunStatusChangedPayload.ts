/**
 * What the JobRunStatusChanged action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobRunStatus } from '../job.run.status.constants';

export interface JobRunStatusChangedPayload {
  /** The new state of the job run. */
  status: JobRunStatus;
}
