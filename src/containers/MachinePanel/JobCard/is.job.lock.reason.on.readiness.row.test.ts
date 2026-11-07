import { describe, expect, it } from 'vitest';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { JOB_READINESS_STEP } from '../../../utils/states/job.readiness.selector';
import { isJobLockReasonOnNextStep } from './is.job.lock.reason.on.next.step';

describe(isJobLockReasonOnNextStep.name, () => {
  it('is true when the next-step button already asks for the same thing', () => {
    expect(isJobLockReasonOnNextStep(DEFAULT.JOB_LOCK_SHORT_CONNECT, JOB_READINESS_STEP.CONNECT)).toBe(true);
    expect(isJobLockReasonOnNextStep(DEFAULT.JOB_LOCK_SHORT_PROFILE, JOB_READINESS_STEP.PROFILE)).toBe(true);
  });

  it('is false for another next step, no next step or no lock reason', () => {
    expect(isJobLockReasonOnNextStep(DEFAULT.JOB_LOCK_SHORT_CONNECT, JOB_READINESS_STEP.MATERIAL)).toBe(false);
    expect(isJobLockReasonOnNextStep(DEFAULT.JOB_LOCK_SHORT_CONNECT, undefined)).toBe(false);
    expect(isJobLockReasonOnNextStep(undefined, JOB_READINESS_STEP.CONNECT)).toBe(false);
  });
});
