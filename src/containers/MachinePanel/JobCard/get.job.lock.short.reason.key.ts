/**
 * Gets the few words shown under the locked Start, Frame and Export buttons: the short form of the first reason that
 * holds one of them back, or nothing while none is locked or a job is running.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../../utils/localization/default.locales';

const JOB_LOCK_SHORT_REASON_KEYS: Readonly<Record<string, string>> = {
  [DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED]: DEFAULT.JOB_LOCK_SHORT_CONNECT,
  [DEFAULT.FRAME_START_BLOCKED_NOT_CONNECTED]: DEFAULT.JOB_LOCK_SHORT_CONNECT,
  [DEFAULT.JOB_START_BLOCKED_NO_PROFILE]: DEFAULT.JOB_LOCK_SHORT_PROFILE,
  [DEFAULT.GCODE_EXPORT_NEEDS_PROFILE]: DEFAULT.JOB_LOCK_SHORT_PROFILE,
  [DEFAULT.GCODE_EXPORT_NEEDS_LAYER]: DEFAULT.JOB_LOCK_SHORT_LAYER,
  [DEFAULT.JOB_START_BLOCKED_NO_TOOLPATH]: DEFAULT.JOB_LOCK_SHORT_TOOLPATH,
  [DEFAULT.JOB_START_BLOCKED_WARNINGS]: DEFAULT.JOB_LOCK_SHORT_WARNINGS,
  [DEFAULT.JOB_START_BLOCKED_NOT_IDLE]: DEFAULT.JOB_LOCK_SHORT_BUSY,
  [DEFAULT.FRAME_START_BLOCKED_LASER_MODE]: DEFAULT.JOB_LOCK_SHORT_LASER_MODE,
  [DEFAULT.FRAME_START_BLOCKED_NO_BURN_MOVES]: DEFAULT.JOB_LOCK_SHORT_NOTHING_TO_FRAME,
  [DEFAULT.FRAME_START_BLOCKED_BED_OVERRUN]: DEFAULT.JOB_LOCK_SHORT_OFF_BED,
  [DEFAULT.FRAME_START_BLOCKED_NO_WORK_POSITION]: DEFAULT.JOB_LOCK_SHORT_NO_POSITION,
};

/** The blocked-reason keys in button order: Start, Frame, then Export. */
export const getJobLockShortReasonKey = (blockedReasonKeys: (string | undefined)[]): string | undefined => {
  if (blockedReasonKeys.includes(DEFAULT.JOB_START_BLOCKED_RUNNING)) {
    return undefined;
  }

  for (const blockedReasonKey of blockedReasonKeys) {
    const shortReasonKey: string | undefined = blockedReasonKey && JOB_LOCK_SHORT_REASON_KEYS[blockedReasonKey];

    if (shortReasonKey) {
      return shortReasonKey;
    }
  }

  return undefined;
};
