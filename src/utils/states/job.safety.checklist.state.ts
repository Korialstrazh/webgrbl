/**
 * The safety checklist the user confirms before a job starts: it holds the start that waits for the confirmation.
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
import type { JobSafetyChecklistState } from './interfaces/JobSafetyChecklistState';
import type { JobStartRequest } from './interfaces/JobStartRequest';

// #region State name
export const JOB_SAFETY_CHECKLIST_STATE_NAME = 'jobSafetyChecklist';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(JOB_SAFETY_CHECKLIST_STATE_NAME);
// #endregion

// #region Actions
export class JobSafetyChecklistOpened extends Action<JobStartRequest> {
  public static readonly type: string = actionType('opened');
}

export class JobSafetyChecklistClosed extends Action {
  public static readonly type: string = actionType('closed');
}
// #endregion

// #region Reducer
const INITIAL_JOB_SAFETY_CHECKLIST_STATE: JobSafetyChecklistState = { request: undefined };

export const jobSafetyChecklistReducer = (
  state: JobSafetyChecklistState = INITIAL_JOB_SAFETY_CHECKLIST_STATE,
  action: Action<unknown>,
): JobSafetyChecklistState => {
  switch (action.type) {
  case JobSafetyChecklistOpened.type:
    return { request: (action as JobSafetyChecklistOpened).payload };
  case JobSafetyChecklistClosed.type:
    return INITIAL_JOB_SAFETY_CHECKLIST_STATE;
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [JOB_SAFETY_CHECKLIST_STATE_NAME]: JobSafetyChecklistState };

export const selectJobSafetyChecklistRequest = (state: RootState): JobStartRequest | undefined =>
  state[JOB_SAFETY_CHECKLIST_STATE_NAME].request;
// #endregion
