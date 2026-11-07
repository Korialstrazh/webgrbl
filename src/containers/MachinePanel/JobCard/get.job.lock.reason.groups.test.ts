import { describe, expect, it } from 'vitest';
import { getJobLockReasonGroups } from './get.job.lock.reason.groups';
import { JOB_LOCK_ACTION } from './job.lock.action.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';

describe('getJobLockReasonGroups', () => {
  it('gives Start and Frame one Connect line and Export its own artwork line in an empty project', () => {
    expect(getJobLockReasonGroups([
      { action: JOB_LOCK_ACTION.START, blockedReasonKey: DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED },
      { action: JOB_LOCK_ACTION.FRAME, blockedReasonKey: DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED },
      { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: DEFAULT.GCODE_EXPORT_NEEDS_ARTWORK },
    ])).toEqual([
      { shortReasonKey: DEFAULT.JOB_LOCK_SHORT_CONNECT, actions: [JOB_LOCK_ACTION.START, JOB_LOCK_ACTION.FRAME] },
      { shortReasonKey: DEFAULT.JOB_LOCK_SHORT_ARTWORK, actions: [JOB_LOCK_ACTION.EXPORT] },
    ]);
  });

  it('keeps the own reason of Frame when only it is locked differently', () => {
    expect(getJobLockReasonGroups([
      { action: JOB_LOCK_ACTION.START, blockedReasonKey: undefined },
      { action: JOB_LOCK_ACTION.FRAME, blockedReasonKey: DEFAULT.FRAME_START_BLOCKED_LASER_MODE },
      { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: DEFAULT.GCODE_EXPORT_NEEDS_LAYER },
    ])).toEqual([
      { shortReasonKey: DEFAULT.JOB_LOCK_SHORT_LASER_MODE, actions: [JOB_LOCK_ACTION.FRAME] },
      { shortReasonKey: DEFAULT.JOB_LOCK_SHORT_LAYER, actions: [JOB_LOCK_ACTION.EXPORT] },
    ]);
  });

  it('shares one profile line between Start and Export', () => {
    expect(getJobLockReasonGroups([
      { action: JOB_LOCK_ACTION.START, blockedReasonKey: DEFAULT.JOB_START_BLOCKED_NO_PROFILE },
      { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: DEFAULT.GCODE_EXPORT_NEEDS_PROFILE },
    ])).toEqual([
      { shortReasonKey: DEFAULT.JOB_LOCK_SHORT_PROFILE, actions: [JOB_LOCK_ACTION.START, JOB_LOCK_ACTION.EXPORT] },
    ]);
  });

  it('shows nothing while a job runs or nothing is locked', () => {
    expect(getJobLockReasonGroups([
      { action: JOB_LOCK_ACTION.START, blockedReasonKey: DEFAULT.JOB_START_BLOCKED_RUNNING },
      { action: JOB_LOCK_ACTION.EXPORT, blockedReasonKey: DEFAULT.GCODE_EXPORT_NEEDS_LAYER },
    ])).toEqual([]);
    expect(getJobLockReasonGroups([{ action: JOB_LOCK_ACTION.START, blockedReasonKey: undefined }])).toEqual([]);
  });
});
