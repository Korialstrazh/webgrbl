/**
 * Gets the few words shown under each locked Start, Frame and Export button: the short form of that action's own
 * reason, in plain text. Nothing shows while a job is running.
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
import type { JobLockAction } from './job.lock.action.constants';

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

/** The short reason key of each locked action; an action that is free, or has no short form, is left out. */
export const getJobLockShortReasonKeys = (
  actionReasons: JobLockActionReason[],
): Partial<Record<JobLockAction, string>> => {
  if (actionReasons.some(isJobRunReason)) {
    return {};
  }

  const shortReasonKeys: Partial<Record<JobLockAction, string>> = {};

  for (const { action, blockedReasonKey } of actionReasons) {
    const shortReasonKey: string | undefined = blockedReasonKey && JOB_LOCK_SHORT_REASON_KEYS[blockedReasonKey];

    if (shortReasonKey) {
      shortReasonKeys[action] = shortReasonKey;
    }
  }

  return shortReasonKeys;
};
