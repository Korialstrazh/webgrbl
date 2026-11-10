/**
 * The lock dot text of Start, Frame and Export, one source for the Job card and the narrow bottom bar: every action
 * that is locked gets a dot, with its short reason, or its full reason when it has no short form. Nothing shows while
 * a job is running.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { GcodeExportAvailability } from '../../../utils/hooks/interfaces/GcodeExportAvailability';
import { useGcodeExportAvailability } from '../../../utils/hooks/use.gcode.export.availability';
import { selectFrameStartBlockedReasonKey } from '../../../utils/states/frame.start.blocked.reason.selector';
import { selectJobStartBlockedReasonKey } from '../../../utils/states/job.start.blocked.reason.selector';
import { getJobLockShortReasonKeys } from './get.job.lock.short.reason.keys';
import { JOB_LOCK_ACTION } from './job.lock.action.constants';
import type { JobLockAction } from './job.lock.action.constants';

export const useJobLockNoteTexts = (): Partial<Record<JobLockAction, string>> => {
  const { t } = useTranslation();
  const jobStartBlockedReasonKey: string | undefined = useSelector(selectJobStartBlockedReasonKey);
  const frameStartBlockedReasonKey: string | undefined = useSelector(selectFrameStartBlockedReasonKey);
  const { gcodeExportBlockedReasonKey }: GcodeExportAvailability = useGcodeExportAvailability();
  const shortReasonKeys: Partial<Record<JobLockAction, string>> = getJobLockShortReasonKeys([
    { action: JOB_LOCK_ACTION.START, blockedReasonKey: jobStartBlockedReasonKey },
    { action: JOB_LOCK_ACTION.FRAME, blockedReasonKey: frameStartBlockedReasonKey },
    { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: gcodeExportBlockedReasonKey },
  ]);
  const noteTexts: Partial<Record<JobLockAction, string>> = {};

  for (const [action, shortReasonKey] of Object.entries(shortReasonKeys)) {
    noteTexts[action as JobLockAction] = t(shortReasonKey);
  }

  return noteTexts;
};
