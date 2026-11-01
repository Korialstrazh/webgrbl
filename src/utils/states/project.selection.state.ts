/**
 * The selection on the bed: which project objects are selected. Selectors drop ids that left the document, for
 * example through an undo.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { createSelector } from '@reduxjs/toolkit';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { ProjectObjectIdsPayload } from './interfaces/ProjectObjectIdsPayload';
import {
  PROJECT_DOCUMENT_STATE_NAME,
  ProjectDocumentLoaded,
  ProjectObjectsDeleted,
  selectProjectObjects,
} from './project.document.state';
import type { ProjectDocumentState } from './project.document.state';

// #region State
export interface ProjectSelectionState {
  /** Ids of the selected objects, as last selected. */
  selectedObjectIds: string[];
}
// #endregion

// #region State name
export const PROJECT_SELECTION_STATE_NAME = 'projectSelection';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(PROJECT_SELECTION_STATE_NAME);
// #endregion

// #region Actions
export class ProjectSelectionChanged extends Action<ProjectObjectIdsPayload> {
  public static readonly type: string = actionType('project selection changed');
}
// #endregion

// #region Initial state
const INITIAL_PROJECT_SELECTION_STATE: ProjectSelectionState = {
  selectedObjectIds: [],
};
// #endregion

// #region Reducer
const getStateWithoutIds = (state: ProjectSelectionState, removedIds: string[]): ProjectSelectionState => ({
  selectedObjectIds: state.selectedObjectIds.filter((objectId: string): boolean => !removedIds.includes(objectId)),
});

const getStateWithOnlyIds = (state: ProjectSelectionState, keptObjects: ProjectObject[]): ProjectSelectionState => ({
  selectedObjectIds: state.selectedObjectIds.filter((objectId: string): boolean =>
    keptObjects.some((projectObject: ProjectObject): boolean => projectObject.id === objectId)),
});

export const projectSelectionReducer = (
  state: ProjectSelectionState = INITIAL_PROJECT_SELECTION_STATE,
  action: Action<unknown>,
): ProjectSelectionState => {
  switch (action.type) {
  case ProjectSelectionChanged.type:
    return { selectedObjectIds: (action as ProjectSelectionChanged).payload.objectIds };
  case ProjectObjectsDeleted.type:
    return getStateWithoutIds(state, (action as ProjectObjectsDeleted).payload.objectIds);
  case ProjectDocumentLoaded.type:
    return getStateWithOnlyIds(state, (action as ProjectDocumentLoaded).payload.document.objects);
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = {
  [PROJECT_SELECTION_STATE_NAME]: ProjectSelectionState;
  [PROJECT_DOCUMENT_STATE_NAME]: ProjectDocumentState;
};

const selectRawSelectedObjectIds = (state: RootState): string[] =>
  state[PROJECT_SELECTION_STATE_NAME].selectedObjectIds;

export const selectSelectedObjects = createSelector(
  [selectRawSelectedObjectIds, selectProjectObjects],
  (selectedObjectIds: string[], projectObjects: ProjectObject[]): ProjectObject[] =>
    projectObjects.filter((projectObject: ProjectObject): boolean => selectedObjectIds.includes(projectObject.id)),
);

export const selectSelectedObjectIds = createSelector(
  [selectSelectedObjects],
  (selectedObjects: ProjectObject[]): string[] =>
    selectedObjects.map((projectObject: ProjectObject): string => projectObject.id),
);
// #endregion
