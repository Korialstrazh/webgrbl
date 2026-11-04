/**
 * The job run on the laser: only its status lives here, as the controller and the program stay in the saga.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_CONNECTION_STATUS } from '../grbl/grbl.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import { ConnectionStatusChanged } from './grbl.connection.state';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { JobRunStatusChangedPayload } from './interfaces/JobRunStatusChangedPayload';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';

// #region State
export interface JobRunState {
  /** Where the latest job run stands. */
  status: JobRunStatus;
}
// #endregion

// #region State name
export const JOB_RUN_STATE_NAME = 'jobRun';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(JOB_RUN_STATE_NAME);
// #endregion

// #region Actions
export class JobStartRequested extends Action {
  public static readonly type: string = actionType('job start requested');
}

export class JobRunStatusChanged extends Action<JobRunStatusChangedPayload> {
  public static readonly type: string = actionType('job run status changed');
}
// #endregion

// #region Reducer
const INITIAL_JOB_RUN_STATE: JobRunState = { status: JOB_RUN_STATUS.IDLE };

const ACTIVE_JOB_RUN_STATUSES: readonly JobRunStatus[] = [JOB_RUN_STATUS.SENDING, JOB_RUN_STATUS.FINISHING];

const isJobRunCutOffByConnection = (state: JobRunState, action: ConnectionStatusChanged): boolean =>
  ACTIVE_JOB_RUN_STATUSES.includes(state.status)
  && action.payload.connectionStatus !== GRBL_CONNECTION_STATUS.CONNECTED;

export const jobRunReducer = (state: JobRunState = INITIAL_JOB_RUN_STATE, action: Action<unknown>): JobRunState => {
  switch (action.type) {
  case JobRunStatusChanged.type:
    return { status: (action as JobRunStatusChanged).payload.status };
  case ConnectionStatusChanged.type:
    // The saga of the run is cancelled with the connection, so the end of the run is recorded here.
    return isJobRunCutOffByConnection(state, action as ConnectionStatusChanged)
      ? { status: JOB_RUN_STATUS.INTERRUPTED }
      : state;
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [JOB_RUN_STATE_NAME]: JobRunState };

export const selectJobRunStatus = (state: RootState): JobRunStatus => state[JOB_RUN_STATE_NAME].status;

/** True while program lines are sent or the laser still works through them. */
export const selectIsJobRunActive = (state: RootState): boolean =>
  ACTIVE_JOB_RUN_STATUSES.includes(state[JOB_RUN_STATE_NAME].status);
// #endregion
