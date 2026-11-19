import { describe, expect, it } from 'vitest';
import { getJobLockShortReasonKeys } from './get.job.lock.short.reason.keys';
import { JOB_LOCK_ACTION } from './job.lock.action.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';

describe(getJobLockShortReasonKeys.name, () => {
  it('gives Start, Frame and Export each its own short reason in an empty project', () => {
    expect(getJobLockShortReasonKeys([
      { action: JOB_LOCK_ACTION.START, blockedReasonKey: DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED },
      { action: JOB_LOCK_ACTION.FRAME, blockedReasonKey: DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED },
      { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: DEFAULT.GCODE_EXPORT_NEEDS_ARTWORK },
    ])).toEqual({
      [JOB_LOCK_ACTION.START]: DEFAULT.JOB_LOCK_SHORT_CONNECT,
      [JOB_LOCK_ACTION.FRAME]: DEFAULT.JOB_LOCK_SHORT_CONNECT,
      [JOB_LOCK_ACTION.EXPORT]: DEFAULT.JOB_LOCK_SHORT_ARTWORK,
    });
  });

  it('leaves out an action that is free', () => {
    expect(getJobLockShortReasonKeys([
      { action: JOB_LOCK_ACTION.START, blockedReasonKey: undefined },
      { action: JOB_LOCK_ACTION.FRAME, blockedReasonKey: DEFAULT.FRAME_START_BLOCKED_LASER_MODE },
      { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: DEFAULT.GCODE_EXPORT_NEEDS_LAYER },
    ])).toEqual({
      [JOB_LOCK_ACTION.FRAME]: DEFAULT.JOB_LOCK_SHORT_LASER_MODE,
      [JOB_LOCK_ACTION.EXPORT]: DEFAULT.JOB_LOCK_SHORT_LAYER,
    });
  });

  it('shows nothing while a job runs or nothing is locked', () => {
    expect(getJobLockShortReasonKeys([
      { action: JOB_LOCK_ACTION.START, blockedReasonKey: DEFAULT.JOB_START_BLOCKED_RUNNING },
      { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: DEFAULT.GCODE_EXPORT_NEEDS_LAYER },
    ])).toEqual({});
    expect(getJobLockShortReasonKeys([{ action: JOB_LOCK_ACTION.START, blockedReasonKey: undefined }])).toEqual({});
  });
});
