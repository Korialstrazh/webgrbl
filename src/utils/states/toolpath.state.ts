/**
 * The toolpath of the open project: whether it is being generated, ready, out of date or failed, the generation
 * progress, and whether the G-code export waits for the user to confirm the toolpath's warnings.
 *
 * Every document change bumps documentVersion and makes a ready toolpath stale. A result carries the version its
 * generation read, so a result for an older document is dropped instead of shown as current.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { GcodeExportRequestPayload } from './interfaces/GcodeExportRequestPayload';
import type { ToolpathProgressPayload } from './interfaces/ToolpathProgressPayload';
import type { ToolpathReadyPayload } from './interfaces/ToolpathReadyPayload';
import { PROJECT_DOCUMENT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { TOOLPATH_STATUS } from './toolpath.status.constants';
import type { ToolpathStatus } from './toolpath.status.constants';

// #region State
export interface ToolpathState {
  /** Where the toolpath stands. */
  status: ToolpathStatus;
  /** Share of the running generation that is done, from 0 to 1; 1 once ready. */
  progress: number;
  /** The latest toolpath, kept while it is stale or regenerated; undefined before the first result. */
  toolpath: Toolpath | undefined;
  /** Counts the document changes, so a result made for an older document can be told apart. */
  documentVersion: number;
  /** Whether the export waits for the user to confirm the warnings of the ready toolpath. */
  isGcodeExportConfirmationOpen: boolean;
}
// #endregion

// #region State name
export const TOOLPATH_STATE_NAME = 'toolpath';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(TOOLPATH_STATE_NAME);
// #endregion

// #region Actions
export class ToolpathRequested extends Action {
  public static readonly type: string = actionType('toolpath requested');
}

export class ToolpathProgress extends Action<ToolpathProgressPayload> {
  public static readonly type: string = actionType('toolpath progress');
}

export class ToolpathReady extends Action<ToolpathReadyPayload> {
  public static readonly type: string = actionType('toolpath ready');
}

export class ToolpathFailed extends Action {
  public static readonly type: string = actionType('toolpath failed');
}

export class ToolpathCancelled extends Action {
  public static readonly type: string = actionType('toolpath cancelled');
}

export class GcodeExportRequested extends Action<GcodeExportRequestPayload> {
  public static readonly type: string = actionType('gcode export requested');
}

export class GcodeExportConfirmationRequested extends Action {
  public static readonly type: string = actionType('gcode export confirmation requested');
}

export class GcodeExportConfirmationClosed extends Action {
  public static readonly type: string = actionType('gcode export confirmation closed');
}
// #endregion

// #region Initial state
const INITIAL_TOOLPATH_STATE: ToolpathState = {
  status: TOOLPATH_STATUS.IDLE,
  progress: 0,
  toolpath: undefined,
  documentVersion: 0,
  isGcodeExportConfirmationOpen: false,
};

const FULL_PROGRESS = 1;
// #endregion

// #region Reducer
const getStateAfterDocumentChange = (state: ToolpathState): ToolpathState => ({
  ...state,
  status: state.status === TOOLPATH_STATUS.READY ? TOOLPATH_STATUS.STALE : state.status,
  documentVersion: state.documentVersion + 1,
  isGcodeExportConfirmationOpen: false,
});

const getStateWithResult = (state: ToolpathState, { toolpath, documentVersion }: ToolpathReadyPayload): ToolpathState =>
  documentVersion === state.documentVersion
    ? { ...state, status: TOOLPATH_STATUS.READY, progress: FULL_PROGRESS, toolpath }
    : state;

const getStateWithProgress = (state: ToolpathState, progress: number): ToolpathState =>
  state.status === TOOLPATH_STATUS.GENERATING ? { ...state, progress } : state;

/** A cancelled generation leaves the older toolpath, if any, as stale; without one there is nothing to show. */
const getStateAfterCancel = (state: ToolpathState): ToolpathState => {
  if (state.status !== TOOLPATH_STATUS.GENERATING) {
    return state;
  }

  return { ...state, status: state.toolpath ? TOOLPATH_STATUS.STALE : TOOLPATH_STATUS.IDLE, progress: 0 };
};

const getStateWithExportAction = (state: ToolpathState, action: Action<unknown>): ToolpathState => {
  switch (action.type) {
  case GcodeExportConfirmationRequested.type:
    return { ...state, isGcodeExportConfirmationOpen: true };
  case GcodeExportConfirmationClosed.type:
  case GcodeExportRequested.type:
    return { ...state, isGcodeExportConfirmationOpen: false };
  default:
    return PROJECT_DOCUMENT_CHANGE_ACTION_TYPES.includes(action.type) ? getStateAfterDocumentChange(state) : state;
  }
};

export const toolpathReducer = (
  state: ToolpathState = INITIAL_TOOLPATH_STATE,
  action: Action<unknown>,
): ToolpathState => {
  switch (action.type) {
  case ToolpathRequested.type:
    return { ...state, status: TOOLPATH_STATUS.GENERATING, progress: 0 };
  case ToolpathProgress.type:
    return getStateWithProgress(state, (action as ToolpathProgress).payload.progress);
  case ToolpathReady.type:
    return getStateWithResult(state, (action as ToolpathReady).payload);
  case ToolpathFailed.type:
    return { ...state, status: TOOLPATH_STATUS.FAILED, progress: 0 };
  case ToolpathCancelled.type:
    return getStateAfterCancel(state);
  default:
    return getStateWithExportAction(state, action);
  }
};
// #endregion

// #region Selectors
type RootState = { [TOOLPATH_STATE_NAME]: ToolpathState };

export const selectToolpath = (state: RootState): Toolpath | undefined => state[TOOLPATH_STATE_NAME].toolpath;

export const selectToolpathStatus = (state: RootState): ToolpathStatus => state[TOOLPATH_STATE_NAME].status;

export const selectToolpathProgress = (state: RootState): number => state[TOOLPATH_STATE_NAME].progress;

export const selectToolpathDocumentVersion = (state: RootState): number => state[TOOLPATH_STATE_NAME].documentVersion;

export const selectIsGcodeExportConfirmationOpen = (state: RootState): boolean =>
  state[TOOLPATH_STATE_NAME].isGcodeExportConfirmationOpen;
// #endregion
