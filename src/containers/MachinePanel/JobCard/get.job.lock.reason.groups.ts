/**
 * Gets the few words shown under the locked Start, Frame and Export buttons: each locked action keeps the short form
 * of its own reason, and actions that share a reason share one line. Nothing shows while a job is running.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { JobLockActionReason } from './interfaces/JobLockActionReason';
import type { JobLockReasonGroup } from './interfaces/JobLockReasonGroup';

const JOB_LOCK_SHORT_REASON_KEYS: Readonly<Record<string, string>> = {
  [DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED]: DEFAULT.JOB_LOCK_SHORT_CONNECT,
  [DEFAULT.FRAME_START_BLOCKED_NOT_CONNECTED]: DEFAULT.JOB_LOCK_SHORT_CONNECT,
  [DEFAULT.JOB_START_BLOCKED_NO_PROFILE]: DEFAULT.JOB_LOCK_SHORT_PROFILE,
  [DEFAULT.GCODE_EXPORT_NEEDS_PROFILE]: DEFAULT.JOB_LOCK_SHORT_PROFILE,
  [DEFAULT.GCODE_EXPORT_NEEDS_ARTWORK]: DEFAULT.JOB_LOCK_SHORT_ARTWORK,
  [DEFAULT.GCODE_EXPORT_NEEDS_LAYER]: DEFAULT.JOB_LOCK_SHORT_LAYER,
  [DEFAULT.JOB_START_BLOCKED_NO_TOOLPATH]: DEFAULT.JOB_LOCK_SHORT_TOOLPATH,
  [DEFAULT.JOB_START_BLOCKED_WARNINGS]: DEFAULT.JOB_LOCK_SHORT_WARNINGS,
  [DEFAULT.JOB_START_BLOCKED_NOT_IDLE]: DEFAULT.JOB_LOCK_SHORT_BUSY,
  [DEFAULT.FRAME_START_BLOCKED_LASER_MODE]: DEFAULT.JOB_LOCK_SHORT_LASER_MODE,
  [DEFAULT.FRAME_START_BLOCKED_NO_BURN_MOVES]: DEFAULT.JOB_LOCK_SHORT_NOTHING_TO_FRAME,
  [DEFAULT.FRAME_START_BLOCKED_BED_OVERRUN]: DEFAULT.JOB_LOCK_SHORT_OFF_BED,
  [DEFAULT.FRAME_START_BLOCKED_NO_WORK_POSITION]: DEFAULT.JOB_LOCK_SHORT_NO_POSITION,
};

const isJobRunReason = ({ blockedReasonKey }: JobLockActionReason): boolean =>
  blockedReasonKey === DEFAULT.JOB_START_BLOCKED_RUNNING;

/** The action reasons in button order: Start, Frame, then Export. */
export const getJobLockReasonGroups = (actionReasons: JobLockActionReason[]): JobLockReasonGroup[] => {
  if (actionReasons.some(isJobRunReason)) {
    return [];
  }

  const groups: JobLockReasonGroup[] = [];

  for (const { action, blockedReasonKey } of actionReasons) {
    const shortReasonKey: string | undefined = blockedReasonKey && JOB_LOCK_SHORT_REASON_KEYS[blockedReasonKey];
    const sharedGroup: JobLockReasonGroup | undefined = groups.find(
      (group: JobLockReasonGroup): boolean => group.shortReasonKey === shortReasonKey,
    );

    if (sharedGroup) {
      sharedGroup.actions.push(action);
    } else if (shortReasonKey) {
      groups.push({ shortReasonKey, actions: [action] });
    }
  }

  return groups;
};
