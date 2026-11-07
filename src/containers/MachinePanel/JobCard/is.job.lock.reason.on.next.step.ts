/**
 * Tells whether the short lock reason under the job actions would only repeat the readiness row's next-step button,
 * as "Connect laser" does while Connect is the next step; the button then says it once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../../utils/localization/default.locales';
import { JOB_READINESS_STEP } from '../../../utils/states/job.readiness.selector';
import type { JobReadinessStep } from '../../../utils/states/job.readiness.selector';

const NEXT_STEP_LOCK_SHORT_REASON_KEYS: Readonly<Partial<Record<JobReadinessStep, string>>> = {
  [JOB_READINESS_STEP.CONNECT]: DEFAULT.JOB_LOCK_SHORT_CONNECT,
  [JOB_READINESS_STEP.PROFILE]: DEFAULT.JOB_LOCK_SHORT_PROFILE,
};

export const isJobLockReasonOnNextStep = (
  lockShortReasonKey: string | undefined,
  nextStep: JobReadinessStep | undefined,
): boolean => !!nextStep && !!lockShortReasonKey && NEXT_STEP_LOCK_SHORT_REASON_KEYS[nextStep] === lockShortReasonKey;
