/**
 * Why an interrupted job cannot resume now: the normal start blockers first, then a missing resume point, or a
 * project or laser profile that changed since the run stopped, as the recorded lines no longer match what would run.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../localization/default.locales';
import type { JobResumeState } from './interfaces/JobResumeState';
import { selectJobResume } from './job.resume.state';
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
import { selectActiveMachineProfile } from './machine.profile.state';
import type { AppRootState } from './new.store';
import { selectToolpathDocumentVersion } from './toolpath.state';

export const selectJobResumeBlockedReasonKey = (state: AppRootState): string | undefined => {
  const startBlockedReasonKey: string | undefined = selectJobStartBlockedReasonKey(state);

  if (startBlockedReasonKey) {
    return startBlockedReasonKey;
  }

  const resume: JobResumeState | undefined = selectJobResume(state);

  if (!resume) {
    return DEFAULT.JOB_RESUME_BLOCKED_NO_POINT;
  }

  if (resume.toolpathDocumentVersion !== selectToolpathDocumentVersion(state)) {
    return DEFAULT.JOB_RESUME_BLOCKED_PROJECT_CHANGED;
  }

  if (resume.profileId !== selectActiveMachineProfile(state)?.id) {
    return DEFAULT.JOB_RESUME_BLOCKED_PROFILE_CHANGED;
  }

  return undefined;
};
