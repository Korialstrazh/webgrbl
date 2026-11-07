/**
 * Tells whether the short lock reason under the job actions would only repeat a to-do step of the readiness row, as
 * "Offline" does while Connect is still to do or "No artwork" while Artwork is: the padlock stays on the button, the
 * step (and its next-step button) says why once, so the empty and the populated card read the same way.
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

const READINESS_STEP_LOCK_SHORT_REASON_KEYS: Readonly<Partial<Record<JobReadinessStep, string>>> = {
  [JOB_READINESS_STEP.CONNECT]: DEFAULT.JOB_LOCK_SHORT_CONNECT,
  [JOB_READINESS_STEP.PROFILE]: DEFAULT.JOB_LOCK_SHORT_PROFILE,
  [JOB_READINESS_STEP.DESIGN]: DEFAULT.JOB_LOCK_SHORT_ARTWORK,
};

export const isJobLockReasonOnReadinessRow = (
  lockShortReasonKey: string | undefined,
  unmetSteps: readonly JobReadinessStep[],
): boolean =>
  !!lockShortReasonKey &&
  unmetSteps.some(
    (step: JobReadinessStep): boolean => READINESS_STEP_LOCK_SHORT_REASON_KEYS[step] === lockShortReasonKey,
  );
