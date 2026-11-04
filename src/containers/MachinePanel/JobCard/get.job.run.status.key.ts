/**
 * The text key of the status of the latest run, by the kind of run; undefined while no run has started.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../../utils/localization/default.locales';
import { JOB_RUN_KIND } from '../../../utils/states/job.run.kind.constants';
import type { JobRunKind } from '../../../utils/states/job.run.kind.constants';
import { JOB_RUN_STATUS } from '../../../utils/states/job.run.status.constants';
import type { JobRunStatus } from '../../../utils/states/job.run.status.constants';

type JobRunStatusTextKeys = Partial<Record<JobRunStatus, string>>;

const JOB_RUN_STATUS_TEXT_KEYS: JobRunStatusTextKeys = {
  [JOB_RUN_STATUS.SENDING]: DEFAULT.JOB_RUN_STATUS_SENDING,
  [JOB_RUN_STATUS.FINISHING]: DEFAULT.JOB_RUN_STATUS_FINISHING,
  [JOB_RUN_STATUS.COMPLETED]: DEFAULT.JOB_RUN_STATUS_COMPLETED,
  [JOB_RUN_STATUS.INTERRUPTED]: DEFAULT.JOB_RUN_STATUS_INTERRUPTED,
};

const FRAME_RUN_STATUS_TEXT_KEYS: JobRunStatusTextKeys = {
  [JOB_RUN_STATUS.SENDING]: DEFAULT.FRAME_RUN_STATUS_SENDING,
  [JOB_RUN_STATUS.FINISHING]: DEFAULT.FRAME_RUN_STATUS_FINISHING,
  [JOB_RUN_STATUS.COMPLETED]: DEFAULT.FRAME_RUN_STATUS_COMPLETED,
  [JOB_RUN_STATUS.INTERRUPTED]: DEFAULT.FRAME_RUN_STATUS_INTERRUPTED,
};

export const getJobRunStatusKey = (
  runKind: JobRunKind,
  runStatus: JobRunStatus,
  isPaused: boolean,
): string | undefined => {
  const isFrame: boolean = runKind === JOB_RUN_KIND.FRAME;

  if (isPaused) {
    return isFrame ? DEFAULT.FRAME_RUN_STATUS_PAUSED : DEFAULT.JOB_RUN_STATUS_PAUSED;
  }

  return (isFrame ? FRAME_RUN_STATUS_TEXT_KEYS : JOB_RUN_STATUS_TEXT_KEYS)[runStatus];
};
