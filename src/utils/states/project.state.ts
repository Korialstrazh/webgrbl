/**
 * The open project: its id and name, its autosave status, and the list of stored projects. The project saga owns
 * the database; this state only mirrors what it reports and carries the requests the menu and dialogs send.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectSummary } from '../project/interfaces/ProjectSummary';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { ProjectFilePayload } from './interfaces/ProjectFilePayload';
import type { ProjectIdPayload } from './interfaces/ProjectIdPayload';
import type { ProjectNamePayload } from './interfaces/ProjectNamePayload';
import type { ProjectOpenedPayload } from './interfaces/ProjectOpenedPayload';
import type { ProjectSaveStatusPayload } from './interfaces/ProjectSaveStatusPayload';
import type { ProjectSummariesPayload } from './interfaces/ProjectSummariesPayload';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import type { ProjectSaveStatus } from './project.save.status.constants';

// #region State
export interface ProjectState {
  /** Id of the open project; undefined until the first project has opened at start. */
  projectId: string | undefined;
  /** Display name of the open project. */
  name: string;
  /** Whether the open project's document is stored. */
  saveStatus: ProjectSaveStatus;
  /** A save failed and no save has succeeded since, so the failure toast is already on screen. */
  hasSaveFailed: boolean;
  /** Every stored project, most recently changed first, as last loaded. */
  summaries: ProjectSummary[];
}
// #endregion

// #region State name
export const PROJECT_STATE_NAME = 'project';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(PROJECT_STATE_NAME);
// #endregion

// #region Actions
export class ProjectOpened extends Action<ProjectOpenedPayload> {
  public static readonly type: string = actionType('project opened');
}

export class ProjectRenamed extends Action<ProjectNamePayload> {
  public static readonly type: string = actionType('project renamed');
}

export class ProjectSaveStatusChanged extends Action<ProjectSaveStatusPayload> {
  public static readonly type: string = actionType('project save status changed');
}

/** A save was rejected: the document stays unsaved until a later save succeeds. */
export class ProjectSaveFailed extends Action {
  public static readonly type: string = actionType('project save failed');
}

export class ProjectSummariesLoaded extends Action<ProjectSummariesPayload> {
  public static readonly type: string = actionType('project summaries loaded');
}

export class NewProjectRequested extends Action {
  public static readonly type: string = actionType('new project requested');
}

export class ProjectOpenRequested extends Action<ProjectIdPayload> {
  public static readonly type: string = actionType('project open requested');
}

export class ProjectRenameRequested extends Action<ProjectNamePayload> {
  public static readonly type: string = actionType('project rename requested');
}

export class ProjectDeleteRequested extends Action<ProjectIdPayload> {
  public static readonly type: string = actionType('project delete requested');
}

export class ProjectSaveRequested extends Action {
  public static readonly type: string = actionType('project save requested');
}

/** Sent by the autosave timer of the project saga, not by the user; it saves only when something is unsaved. */
export class ProjectAutosaveDue extends Action {
  public static readonly type: string = actionType('project autosave due');
}

export class ProjectSummariesRequested extends Action {
  public static readonly type: string = actionType('project summaries requested');
}

export class ProjectFileExportRequested extends Action {
  public static readonly type: string = actionType('project file export requested');
}

export class ProjectFileImportRequested extends Action<ProjectFilePayload> {
  public static readonly type: string = actionType('project file import requested');
}
// #endregion

// #region Initial state
const INITIAL_PROJECT_STATE: ProjectState = {
  projectId: undefined,
  name: '',
  saveStatus: PROJECT_SAVE_STATUS.SAVED,
  hasSaveFailed: false,
  summaries: [],
};
// #endregion

// #region Reducer
const getStateWithSaveStatus = (state: ProjectState, saveStatus: ProjectSaveStatus): ProjectState => ({
  ...state,
  saveStatus,
  hasSaveFailed: state.hasSaveFailed && saveStatus !== PROJECT_SAVE_STATUS.SAVED,
});

const getStateWithRename = (state: ProjectState, payload: ProjectNamePayload): ProjectState =>
  payload.projectId === state.projectId ? { ...state, name: payload.name } : state;

export const projectReducer = (state: ProjectState = INITIAL_PROJECT_STATE, action: Action<unknown>): ProjectState => {
  switch (action.type) {
  case ProjectOpened.type:
    return {
      ...state,
      projectId: (action as ProjectOpened).payload.projectId,
      name: (action as ProjectOpened).payload.name,
      saveStatus: PROJECT_SAVE_STATUS.SAVED,
    };
  case ProjectRenamed.type:
    return getStateWithRename(state, (action as ProjectRenamed).payload);
  case ProjectSaveStatusChanged.type:
    return getStateWithSaveStatus(state, (action as ProjectSaveStatusChanged).payload.saveStatus);
  case ProjectSaveFailed.type:
    return { ...state, saveStatus: PROJECT_SAVE_STATUS.UNSAVED, hasSaveFailed: true };
  case ProjectSummariesLoaded.type:
    return { ...state, summaries: (action as ProjectSummariesLoaded).payload.summaries };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [PROJECT_STATE_NAME]: ProjectState };

export const selectProjectId = (state: RootState): string | undefined => state[PROJECT_STATE_NAME].projectId;

export const selectProjectName = (state: RootState): string => state[PROJECT_STATE_NAME].name;

export const selectProjectSaveStatus = (state: RootState): ProjectSaveStatus => state[PROJECT_STATE_NAME].saveStatus;

export const selectHasProjectSaveFailed = (state: RootState): boolean => state[PROJECT_STATE_NAME].hasSaveFailed;

export const selectProjectSummaries = (state: RootState): ProjectSummary[] => state[PROJECT_STATE_NAME].summaries;
// #endregion
