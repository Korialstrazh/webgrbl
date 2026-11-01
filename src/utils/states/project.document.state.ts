/**
 * The project document and its undo history: the objects on the bed, with snapshot stacks for undo and redo.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import type { ProjectObjectTransform } from '../project/interfaces/ProjectObjectTransform';
import { MAX_UNDO_STEPS } from '../project/project.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { ProjectDocumentPayload } from './interfaces/ProjectDocumentPayload';
import type { ProjectObjectIdsPayload } from './interfaces/ProjectObjectIdsPayload';
import type { ProjectObjectTransformsPayload } from './interfaces/ProjectObjectTransformsPayload';
import type { ProjectObjectsPayload } from './interfaces/ProjectObjectsPayload';

// #region State
export interface ProjectDocumentState {
  /** The design as it is now. */
  document: ProjectDocument;
  /** Earlier documents, oldest first, at most MAX_UNDO_STEPS. */
  past: ProjectDocument[];
  /** Documents undone and not yet replaced by a new change, next redo last. */
  future: ProjectDocument[];
}
// #endregion

// #region State name
export const PROJECT_DOCUMENT_STATE_NAME = 'projectDocument';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(PROJECT_DOCUMENT_STATE_NAME);
// #endregion

// #region Actions
export class ProjectObjectsAdded extends Action<ProjectObjectsPayload> {
  public static readonly type: string = actionType('project objects added');
}

export class ProjectObjectsTransformed extends Action<ProjectObjectTransformsPayload> {
  public static readonly type: string = actionType('project objects transformed');
}

export class ProjectObjectsDeleted extends Action<ProjectObjectIdsPayload> {
  public static readonly type: string = actionType('project objects deleted');
}

export class ProjectUndoRequested extends Action {
  public static readonly type: string = actionType('project undo requested');
}

export class ProjectRedoRequested extends Action {
  public static readonly type: string = actionType('project redo requested');
}

export class ProjectDocumentLoaded extends Action<ProjectDocumentPayload> {
  public static readonly type: string = actionType('project document loaded');
}
// #endregion

// #region Initial state
const INITIAL_PROJECT_DOCUMENT_STATE: ProjectDocumentState = {
  document: { objects: [] },
  past: [],
  future: [],
};
// #endregion

// #region Reducer
const getStateWithChange = (
  state: ProjectDocumentState,
  changedDocument: ProjectDocument,
): ProjectDocumentState => ({
  document: changedDocument,
  past: [...state.past, state.document].slice(-MAX_UNDO_STEPS),
  future: [],
});

const getStateWithAddedObjects = (state: ProjectDocumentState, addedObjects: ProjectObject[]): ProjectDocumentState =>
  addedObjects.length
    ? getStateWithChange(state, { objects: [...state.document.objects, ...addedObjects] })
    : state;

const getTransformFields = (transform: ProjectObjectTransform): ProjectObjectTransform => ({
  xMm: transform.xMm,
  yMm: transform.yMm,
  widthMm: transform.widthMm,
  heightMm: transform.heightMm,
  rotationDeg: transform.rotationDeg,
});

const isTransformEqualToObject = (projectObject: ProjectObject, transform: ProjectObjectTransform): boolean =>
  projectObject.xMm === transform.xMm
  && projectObject.yMm === transform.yMm
  && projectObject.widthMm === transform.widthMm
  && projectObject.heightMm === transform.heightMm
  && projectObject.rotationDeg === transform.rotationDeg;

const getObjectWithTransform = (
  projectObject: ProjectObject,
  transforms: ProjectObjectTransformsPayload['transforms'],
): ProjectObject => {
  const transform: ProjectObjectTransform | undefined = Object.hasOwn(transforms, projectObject.id)
    ? transforms[projectObject.id]
    : undefined;

  if (!transform || isTransformEqualToObject(projectObject, transform)) {
    return projectObject;
  }

  return { ...projectObject, ...getTransformFields(transform) };
};

const getStateWithTransforms = (
  state: ProjectDocumentState,
  transforms: ProjectObjectTransformsPayload['transforms'],
): ProjectDocumentState => {
  const transformedObjects: ProjectObject[] = state.document.objects.map(
    (projectObject: ProjectObject): ProjectObject => getObjectWithTransform(projectObject, transforms),
  );
  const hasChangedObject: boolean = transformedObjects.some(
    (projectObject: ProjectObject, objectIndex: number): boolean =>
      projectObject !== state.document.objects[objectIndex],
  );

  return hasChangedObject ? getStateWithChange(state, { objects: transformedObjects }) : state;
};

const getStateWithoutObjects = (state: ProjectDocumentState, objectIds: string[]): ProjectDocumentState => {
  const remainingObjects: ProjectObject[] = state.document.objects.filter(
    (projectObject: ProjectObject): boolean => !objectIds.includes(projectObject.id),
  );

  return remainingObjects.length === state.document.objects.length
    ? state
    : getStateWithChange(state, { objects: remainingObjects });
};

const getStateAfterUndo = (state: ProjectDocumentState): ProjectDocumentState => {
  const previousDocument: ProjectDocument | undefined = state.past[state.past.length - 1];

  return previousDocument
    ? { document: previousDocument, past: state.past.slice(0, -1), future: [...state.future, state.document] }
    : state;
};

const getStateAfterRedo = (state: ProjectDocumentState): ProjectDocumentState => {
  const nextDocument: ProjectDocument | undefined = state.future[state.future.length - 1];

  return nextDocument
    ? { document: nextDocument, past: [...state.past, state.document], future: state.future.slice(0, -1) }
    : state;
};

export const projectDocumentReducer = (
  state: ProjectDocumentState = INITIAL_PROJECT_DOCUMENT_STATE,
  action: Action<unknown>,
): ProjectDocumentState => {
  switch (action.type) {
  case ProjectObjectsAdded.type:
    return getStateWithAddedObjects(state, (action as ProjectObjectsAdded).payload.objects);
  case ProjectObjectsTransformed.type:
    return getStateWithTransforms(state, (action as ProjectObjectsTransformed).payload.transforms);
  case ProjectObjectsDeleted.type:
    return getStateWithoutObjects(state, (action as ProjectObjectsDeleted).payload.objectIds);
  case ProjectUndoRequested.type:
    return getStateAfterUndo(state);
  case ProjectRedoRequested.type:
    return getStateAfterRedo(state);
  case ProjectDocumentLoaded.type:
    return { document: (action as ProjectDocumentLoaded).payload.document, past: [], future: [] };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [PROJECT_DOCUMENT_STATE_NAME]: ProjectDocumentState };

export const selectProjectDocument = (state: RootState): ProjectDocument =>
  state[PROJECT_DOCUMENT_STATE_NAME].document;

export const selectProjectObjects = (state: RootState): ProjectObject[] =>
  state[PROJECT_DOCUMENT_STATE_NAME].document.objects;

export const selectCanUndo = (state: RootState): boolean => !!state[PROJECT_DOCUMENT_STATE_NAME].past.length;

export const selectCanRedo = (state: RootState): boolean => !!state[PROJECT_DOCUMENT_STATE_NAME].future.length;
// #endregion
