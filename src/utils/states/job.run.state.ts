/**
 * The job run on the laser: only its status lives here, as the controller and the program stay in the saga.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import { ConnectionEstablished, ConnectionStatusChanged } from './grbl.connection.state';
import { ConsoleCommandSubmitted } from './grbl.console.state';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { JobCutCheckLayersPayload } from './interfaces/JobCutCheckLayersPayload';
import type { JobRunProgressChangedPayload } from './interfaces/JobRunProgressChangedPayload';
import type { JobRunStartedPayload } from './interfaces/JobRunStartedPayload';
import type { JobRunStatusChangedPayload } from './interfaces/JobRunStatusChangedPayload';
import type { JobStartRequest } from './interfaces/JobStartRequest';
import { JOB_RUN_KIND } from './job.run.kind.constants';
import type { JobRunKind } from './job.run.kind.constants';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import type { JobRunStatus } from './job.run.status.constants';
import { MachineStatusReceived } from './machine.status.state';
import { PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';

// #region State
export interface JobRunState {
  /** Where the latest job run stands. */
  status: JobRunStatus;
  /** Program lines of the run the laser has answered. */
  answeredLineCount: number;
  /** Program lines of the run that are sent in all; 0 until the program starts streaming. */
  totalLineCount: number;
  /** When the run started, in milliseconds since the epoch; 0 before the first run. */
  startedAtMs: number;
  /** True once a console line may have changed $32, so the setting read at connect no longer counts. */
  isLaserModeUnconfirmed: boolean;
  /** Whether the latest run is a job or a frame. */
  kind: JobRunKind;
  /** True when the latest run was a frame that an Alarm report ended. */
  isFrameAlarmed: boolean;
  /** Line layer keys of the last job that finished normally, for the cut check; empty once it is closed. */
  cutCheckLayerKeys: string[];
}
// #endregion

// #region State name
export const JOB_RUN_STATE_NAME = 'jobRun';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(JOB_RUN_STATE_NAME);
// #endregion

// #region Actions
export class FrameStartRequested extends Action {
  public static readonly type: string = actionType('frame start requested');
}

/** An alarm ended the frame run, not a stop or reset of the user. */
export class FrameRunAlarmed extends Action {
  public static readonly type: string = actionType('frame run alarmed');
}

export class JobStartRequested extends Action<JobStartRequest> {
  public static readonly type: string = actionType('job start requested');
}

export class JobRunStarted extends Action<JobRunStartedPayload> {
  public static readonly type: string = actionType('job run started');
}

export class JobRunProgressChanged extends Action<JobRunProgressChangedPayload> {
  public static readonly type: string = actionType('job run progress changed');
}

export class JobPauseRequested extends Action {
  public static readonly type: string = actionType('job pause requested');
}

export class JobResumeRequested extends Action {
  public static readonly type: string = actionType('job resume requested');
}

/** A job finished normally: the line layers it burned are kept, so a later edit does not change the cut check. */
export class JobCutCheckLayersCaptured extends Action<JobCutCheckLayersPayload> {
  public static readonly type: string = actionType('job cut check layers captured');
}

export class JobCutCheckDismissed extends Action {
  public static readonly type: string = actionType('job cut check dismissed');
}

export class JobRunStatusChanged extends Action<JobRunStatusChangedPayload> {
  public static readonly type: string = actionType('job run status changed');
}
// #endregion

// #region Reducer
const INITIAL_JOB_RUN_STATE: JobRunState = {
  status: JOB_RUN_STATUS.IDLE,
  answeredLineCount: 0,
  totalLineCount: 0,
  startedAtMs: 0,
  isLaserModeUnconfirmed: false,
  kind: JOB_RUN_KIND.JOB,
  isFrameAlarmed: false,
  cutCheckLayerKeys: [],
};

// Settings are read only at connect: a write to $32 or a settings reset leaves them out of date.
const LASER_MODE_CHANGING_LINE_PATTERN = /^\$(32=|RST=)/i;
const LINE_WHITESPACE_PATTERN = /\s/g;

const isLaserModeChangingLine = (commandText: string): boolean =>
  LASER_MODE_CHANGING_LINE_PATTERN.test(commandText.replace(LINE_WHITESPACE_PATTERN, ''));

const ACTIVE_JOB_RUN_STATUSES: readonly JobRunStatus[] = [JOB_RUN_STATUS.SENDING, JOB_RUN_STATUS.FINISHING];

const isJobRunCutOffByConnection = (state: JobRunState, action: ConnectionStatusChanged): boolean =>
  ACTIVE_JOB_RUN_STATUSES.includes(state.status)
  && action.payload.connectionStatus !== GRBL_CONNECTION_STATUS.CONNECTED;

const isStatusReportInAlarm = (action: MachineStatusReceived): boolean =>
  action.payload.status.machineState === GRBL_MACHINE_STATE.ALARM;

export const jobRunReducer = (state: JobRunState = INITIAL_JOB_RUN_STATE, action: Action<unknown>): JobRunState => {
  switch (action.type) {
  case JobRunStatusChanged.type:
    return { ...state, status: (action as JobRunStatusChanged).payload.status };
  case JobRunStarted.type:
    return {
      ...state,
      status: JOB_RUN_STATUS.SENDING,
      answeredLineCount: 0,
      totalLineCount: 0,
      startedAtMs: (action as JobRunStarted).payload.startedAtMs,
      kind: (action as JobRunStarted).payload.kind,
      isFrameAlarmed: false,
      cutCheckLayerKeys: [],
    };
  case JobCutCheckLayersCaptured.type:
    return { ...state, cutCheckLayerKeys: (action as JobCutCheckLayersCaptured).payload.layerKeys };
  case JobCutCheckDismissed.type:
    return { ...state, cutCheckLayerKeys: [] };
  case FrameRunAlarmed.type:
    return { ...state, isFrameAlarmed: true };
  case MachineStatusReceived.type:
    return state.isFrameAlarmed && !isStatusReportInAlarm(action as MachineStatusReceived)
      ? { ...state, isFrameAlarmed: false }
      : state;
  case ConsoleCommandSubmitted.type:
    return isLaserModeChangingLine((action as ConsoleCommandSubmitted).payload.commandText)
      ? { ...state, isLaserModeUnconfirmed: true }
      : state;
  case ConnectionEstablished.type:
    return { ...state, isLaserModeUnconfirmed: false };
  case JobRunProgressChanged.type:
    return { ...state, ...(action as JobRunProgressChanged).payload };
  case ConnectionStatusChanged.type:
    // The saga of the run is cancelled with the connection, so the end of the run is recorded here.
    return isJobRunCutOffByConnection(state, action as ConnectionStatusChanged)
      ? { ...state, status: JOB_RUN_STATUS.INTERRUPTED }
      : state;
  default:
    // A changed or newly loaded project no longer matches the sheet on the bed.
    return PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES.includes(action.type) && state.cutCheckLayerKeys.length
      ? { ...state, cutCheckLayerKeys: [] }
      : state;
  }
};
// #endregion

// #region Selectors
type RootState = { [JOB_RUN_STATE_NAME]: JobRunState };

export const selectJobRunStatus = (state: RootState): JobRunStatus => state[JOB_RUN_STATE_NAME].status;

export const selectJobRunAnsweredLineCount = (state: RootState): number => state[JOB_RUN_STATE_NAME].answeredLineCount;

export const selectJobRunTotalLineCount = (state: RootState): number => state[JOB_RUN_STATE_NAME].totalLineCount;

export const selectIsLaserModeUnconfirmed = (state: RootState): boolean =>
  state[JOB_RUN_STATE_NAME].isLaserModeUnconfirmed;

export const selectJobRunStartedAtMs = (state: RootState): number => state[JOB_RUN_STATE_NAME].startedAtMs;

export const selectJobRunKind = (state: RootState): JobRunKind => state[JOB_RUN_STATE_NAME].kind;

export const selectJobCutCheckLayerKeys = (state: RootState): string[] => state[JOB_RUN_STATE_NAME].cutCheckLayerKeys;

export const selectIsFrameAlarmed = (state: RootState): boolean => state[JOB_RUN_STATE_NAME].isFrameAlarmed;

/** True while program lines are sent or the laser still works through them. */
export const selectIsJobRunActive = (state: RootState): boolean =>
  ACTIVE_JOB_RUN_STATUSES.includes(state[JOB_RUN_STATE_NAME].status);
// #endregion
