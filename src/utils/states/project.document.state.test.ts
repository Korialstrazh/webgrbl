/**
 * Tests for the project document state: changes, undo and redo, and the selection that follows the document.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { describe, expect, it } from 'vitest';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import { MAX_UNDO_STEPS } from '../project/project.constants';
import { Action } from './action';
import {
  PROJECT_DOCUMENT_STATE_NAME,
  ProjectDocumentLoaded,
  ProjectObjectsAdded,
  ProjectObjectsDeleted,
  ProjectObjectsTransformed,
  ProjectRedoRequested,
  ProjectUndoRequested,
  projectDocumentReducer,
  selectCanRedo,
  selectCanUndo,
  selectProjectDocument,
  selectProjectObjects,
} from './project.document.state';
import type { ProjectDocumentState } from './project.document.state';
import {
  PROJECT_SELECTION_STATE_NAME,
  ProjectSelectionChanged,
  projectSelectionReducer,
  selectSelectedObjectIds,
  selectSelectedObjects,
} from './project.selection.state';
import type { ProjectSelectionState } from './project.selection.state';

const UNKNOWN_ACTION_TYPE = 'unknown action';
const MOVED_X_MM = 55;
const UNKNOWN_OBJECT_ID = 'unknown-object';
const EXTRA_CHANGE_COUNT = 1;
const FIRST_OBJECT_ID = 'a';
const SECOND_OBJECT_ID = 'b';

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

const getInitialState = (): ProjectDocumentState => projectDocumentReducer(undefined, new UnknownAction());

const getStateWithObjects = (objects: ProjectObject[]): ProjectDocumentState =>
  projectDocumentReducer(getInitialState(), new ProjectObjectsAdded({ objects }));

type ProjectRootState = {
  [PROJECT_DOCUMENT_STATE_NAME]: ProjectDocumentState;
  [PROJECT_SELECTION_STATE_NAME]: ProjectSelectionState;
};

const getRootState = (
  documentState: ProjectDocumentState,
  selectionState: ProjectSelectionState,
): ProjectRootState => ({
  [PROJECT_DOCUMENT_STATE_NAME]: documentState,
  [PROJECT_SELECTION_STATE_NAME]: selectionState,
});

describe(projectDocumentReducer.name, () => {
  it('starts empty with no history', () => {
    const state: ProjectDocumentState = getInitialState();

    expect(selectProjectDocument(getRootState(state, { selectedObjectIds: [] }))).toEqual({ objects: [] });
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
  });

  it('adds objects as one undo step', () => {
    const added: ProjectObject = newProjectObject();
    const state: ProjectDocumentState = getStateWithObjects([added]);

    expect(state.document.objects).toEqual([added]);
    expect(state.past).toEqual([{ objects: [] }]);
  });

  it('transforms objects as one undo step', () => {
    const original: ProjectObject = newProjectObject();
    const before: ProjectDocumentState = getStateWithObjects([original]);
    const after: ProjectDocumentState = projectDocumentReducer(
      before,
      new ProjectObjectsTransformed({
        transforms: { [original.id]: { ...original, xMm: MOVED_X_MM } },
      }),
    );

    expect(after.document.objects[0]?.xMm).toBe(MOVED_X_MM);
    expect(after.past).toHaveLength(before.past.length + 1);
    expect(after.past[after.past.length - 1]).toEqual(before.document);
  });

  it('deletes objects as one undo step', () => {
    const kept: ProjectObject = newProjectObject();
    const removed: ProjectObject = newProjectObject();
    const before: ProjectDocumentState = getStateWithObjects([kept, removed]);
    const after: ProjectDocumentState = projectDocumentReducer(
      before,
      new ProjectObjectsDeleted({ objectIds: [removed.id] }),
    );

    expect(after.document.objects).toEqual([kept]);
    expect(after.past).toHaveLength(before.past.length + 1);
  });

  it('does not create an undo step for changes that change nothing', () => {
    const state: ProjectDocumentState = getStateWithObjects([newProjectObject()]);

    expect(projectDocumentReducer(state, new ProjectObjectsAdded({ objects: [] }))).toBe(state);
    expect(projectDocumentReducer(state, new ProjectObjectsDeleted({ objectIds: [UNKNOWN_OBJECT_ID] }))).toBe(state);
    expect(
      projectDocumentReducer(
        state,
        new ProjectObjectsTransformed({ transforms: { [UNKNOWN_OBJECT_ID]: { ...newProjectObject() } } }),
      ),
    ).toBe(state);
  });

  it('ignores a transform equal to the current values and keeps redo', () => {
    const original: ProjectObject = newProjectObject();
    const undoneState: ProjectDocumentState = projectDocumentReducer(
      projectDocumentReducer(
        getStateWithObjects([original]),
        new ProjectObjectsTransformed({ transforms: { [original.id]: { ...original, xMm: MOVED_X_MM } } }),
      ),
      new ProjectUndoRequested(),
    );
    const after: ProjectDocumentState = projectDocumentReducer(
      undoneState,
      new ProjectObjectsTransformed({ transforms: { [original.id]: { ...original } } }),
    );

    expect(after).toBe(undoneState);
    expect(after.future).toHaveLength(1);
  });

  it('undoes to the exact previous document and redoes it', () => {
    const state: ProjectDocumentState = getStateWithObjects([newProjectObject()]);
    const undone: ProjectDocumentState = projectDocumentReducer(state, new ProjectUndoRequested());
    const redone: ProjectDocumentState = projectDocumentReducer(undone, new ProjectRedoRequested());

    expect(undone.document).toBe(state.past[0]);
    expect(selectCanUndo(getRootState(undone, { selectedObjectIds: [] }))).toBe(false);
    expect(selectCanRedo(getRootState(undone, { selectedObjectIds: [] }))).toBe(true);
    expect(redone.document).toBe(state.document);
    expect(redone).toEqual(state);
  });

  it('ignores undo and redo without history', () => {
    const state: ProjectDocumentState = getInitialState();

    expect(projectDocumentReducer(state, new ProjectUndoRequested())).toBe(state);
    expect(projectDocumentReducer(state, new ProjectRedoRequested())).toBe(state);
  });

  it('clears redo on a new change after an undo', () => {
    const undone: ProjectDocumentState = projectDocumentReducer(
      getStateWithObjects([newProjectObject()]),
      new ProjectUndoRequested(),
    );
    const changed: ProjectDocumentState = projectDocumentReducer(
      undone,
      new ProjectObjectsAdded({ objects: [newProjectObject()] }),
    );

    expect(changed.future).toEqual([]);
  });

  it('keeps at most MAX_UNDO_STEPS undo steps', () => {
    let state: ProjectDocumentState = getInitialState();

    for (let changeIndex = 0; changeIndex < MAX_UNDO_STEPS + EXTRA_CHANGE_COUNT; changeIndex++) {
      state = projectDocumentReducer(state, new ProjectObjectsAdded({ objects: [newProjectObject()] }));
    }

    expect(state.past).toHaveLength(MAX_UNDO_STEPS);
    expect(state.past[0]?.objects).toHaveLength(EXTRA_CHANGE_COUNT);
  });

  it('replaces the document and clears both stacks when loaded', () => {
    const undone: ProjectDocumentState = projectDocumentReducer(
      getStateWithObjects([newProjectObject()]),
      new ProjectUndoRequested(),
    );
    const loadedObject: ProjectObject = newProjectObject();
    const loaded: ProjectDocumentState = projectDocumentReducer(
      undone,
      new ProjectDocumentLoaded({ document: { objects: [loadedObject] } }),
    );

    expect(loaded).toEqual({ document: { objects: [loadedObject] }, past: [], future: [] });
  });

  it('selects the objects of the document', () => {
    const projectObject: ProjectObject = newProjectObject();
    const rootState: ProjectRootState = getRootState(getStateWithObjects([projectObject]), { selectedObjectIds: [] });

    expect(selectProjectObjects(rootState)).toEqual([projectObject]);
  });
});

describe(projectSelectionReducer.name, () => {
  it('stores the selected ids', () => {
    const state: ProjectSelectionState = projectSelectionReducer(
      undefined,
      new ProjectSelectionChanged({ objectIds: [FIRST_OBJECT_ID] }),
    );

    expect(state.selectedObjectIds).toEqual([FIRST_OBJECT_ID]);
  });

  it('drops a deleted object from the selection', () => {
    const state: ProjectSelectionState = projectSelectionReducer(
      { selectedObjectIds: [FIRST_OBJECT_ID, SECOND_OBJECT_ID] },
      new ProjectObjectsDeleted({ objectIds: [FIRST_OBJECT_ID] }),
    );

    expect(state.selectedObjectIds).toEqual([SECOND_OBJECT_ID]);
  });

  it('keeps only ids of the loaded document', () => {
    const kept: ProjectObject = newProjectObject();
    const state: ProjectSelectionState = projectSelectionReducer(
      { selectedObjectIds: [kept.id, UNKNOWN_OBJECT_ID] },
      new ProjectDocumentLoaded({ document: { objects: [kept] } }),
    );

    expect(state.selectedObjectIds).toEqual([kept.id]);
  });

  it('leaves an undone add out of the selected ids and objects', () => {
    const added: ProjectObject = newProjectObject();
    const documentState: ProjectDocumentState = getStateWithObjects([added]);
    const selection: ProjectSelectionState = { selectedObjectIds: [added.id] };
    const undone: ProjectDocumentState = projectDocumentReducer(documentState, new ProjectUndoRequested());

    expect(selectSelectedObjectIds(getRootState(documentState, selection))).toEqual([added.id]);
    expect(selectSelectedObjects(getRootState(documentState, selection))).toEqual([added]);
    expect(selectSelectedObjectIds(getRootState(undone, selection))).toEqual([]);
    expect(selectSelectedObjects(getRootState(undone, selection))).toEqual([]);
  });
});
