import { describe, expect, it } from 'vitest';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { JOB_READINESS_STEP } from '../../../utils/states/job.readiness.selector';
import { isJobLockReasonOnReadinessRow } from './is.job.lock.reason.on.readiness.row';

describe(isJobLockReasonOnReadinessRow.name, () => {
  it('is true when a to-do step of the readiness row already says the same thing', () => {
    expect(isJobLockReasonOnReadinessRow(DEFAULT.JOB_LOCK_SHORT_CONNECT, [JOB_READINESS_STEP.CONNECT])).toBe(true);
    expect(isJobLockReasonOnReadinessRow(DEFAULT.JOB_LOCK_SHORT_PROFILE, [JOB_READINESS_STEP.PROFILE])).toBe(true);
    expect(isJobLockReasonOnReadinessRow(
      DEFAULT.JOB_LOCK_SHORT_CONNECT,
      [JOB_READINESS_STEP.DESIGN, JOB_READINESS_STEP.CONNECT],
    )).toBe(true);
    expect(isJobLockReasonOnReadinessRow(DEFAULT.JOB_LOCK_SHORT_ARTWORK, [JOB_READINESS_STEP.DESIGN])).toBe(true);
  });

  it('is false for a reason no to-do step says, no to-do step or no lock reason', () => {
    expect(isJobLockReasonOnReadinessRow(DEFAULT.JOB_LOCK_SHORT_CONNECT, [JOB_READINESS_STEP.MATERIAL])).toBe(false);
    expect(isJobLockReasonOnReadinessRow(DEFAULT.JOB_LOCK_SHORT_BUSY, [JOB_READINESS_STEP.CONNECT])).toBe(false);
    expect(isJobLockReasonOnReadinessRow(DEFAULT.JOB_LOCK_SHORT_CONNECT, [])).toBe(false);
    expect(isJobLockReasonOnReadinessRow(undefined, [JOB_READINESS_STEP.CONNECT])).toBe(false);
  });
});
