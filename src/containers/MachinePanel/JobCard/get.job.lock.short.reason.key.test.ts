import { describe, expect, it } from 'vitest';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getJobLockShortReasonKey } from './get.job.lock.short.reason.key';

describe(getJobLockShortReasonKey.name, () => {
  it('asks for the connection while Start and Frame wait for it', () => {
    expect(getJobLockShortReasonKey([
      DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED,
      DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED,
      undefined,
    ])).toBe(DEFAULT.JOB_LOCK_SHORT_CONNECT);
  });

  it('takes the first locked button in order', () => {
    expect(getJobLockShortReasonKey([
      undefined,
      DEFAULT.FRAME_START_BLOCKED_LASER_MODE,
      DEFAULT.GCODE_EXPORT_NEEDS_LAYER,
    ])).toBe(DEFAULT.JOB_LOCK_SHORT_LASER_MODE);
  });

  it('names a missing layer when only Export is locked', () => {
    expect(getJobLockShortReasonKey([undefined, undefined, DEFAULT.GCODE_EXPORT_NEEDS_LAYER]))
      .toBe(DEFAULT.JOB_LOCK_SHORT_LAYER);
  });

  it('shows nothing while a job runs or nothing is locked', () => {
    expect(getJobLockShortReasonKey([DEFAULT.JOB_START_BLOCKED_RUNNING, undefined, undefined])).toBeUndefined();
    expect(getJobLockShortReasonKey([undefined, undefined, undefined])).toBeUndefined();
  });
});
