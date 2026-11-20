/**
 * The resume state of a job run that stopped early. It stays through a lost connection, so the run can go on in the
 * same session.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { JobResumeSliceState } from './interfaces/JobResumeSliceState';
import type { JobResumeState } from './interfaces/JobResumeState';
import { ProjectDocumentLoaded } from './project.document.state';

// #region State name
export const JOB_RESUME_STATE_NAME = 'jobResume';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(JOB_RESUME_STATE_NAME);
// #endregion

// #region Actions
export class JobResumePointRecorded extends Action<JobResumeState> {
  public static readonly type: string = actionType('point recorded');
}

export class JobResumePointCleared extends Action {
  public static readonly type: string = actionType('point cleared');
}
// #endregion

// #region Reducer
const INITIAL_JOB_RESUME_STATE: JobResumeSliceState = { resume: undefined };

export const jobResumeReducer = (
  state: JobResumeSliceState = INITIAL_JOB_RESUME_STATE,
  action: Action<unknown>,
): JobResumeSliceState => {
  switch (action.type) {
  case JobResumePointRecorded.type:
    return { resume: (action as JobResumePointRecorded).payload };
  case JobResumePointCleared.type:
  // A newly loaded project is not the one that stopped.
  case ProjectDocumentLoaded.type:
    return INITIAL_JOB_RESUME_STATE;
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [JOB_RESUME_STATE_NAME]: JobResumeSliceState };

export const selectJobResume = (state: RootState): JobResumeState | undefined => state[JOB_RESUME_STATE_NAME].resume;
// #endregion
