/**
 * What the JobRunStatusChanged action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { JobRunStatus } from '../job.run.status.constants';

export interface JobRunStatusChangedPayload {
  /** The new state of the job run. */
  status: JobRunStatus;
}
