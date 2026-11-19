/**
 * The project document and its undo history: the objects on the bed and their laser layers, with snapshot stacks for
 * undo and redo.
 *
 * Layers are derived from the palette in the sagas, before the action is put, so this reducer stays pure: the added
 * objects bring their layers in the payload and both land in one undo step. Undo and redo restore the snapshot as it
 * was and never derive again. A layer whose colour no object draws any more stays in the document, hidden by
 * selectProjectLayers, so an undo brings it back with its settings.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { createSelector } from '@reduxjs/toolkit';
import { getLayerKey } from '../layers/get.layer.key';
import { getLayersInOrder } from '../layers/get.layers.in.order';
import { getLayersWithEnabledState } from '../layers/get.layers.with.enabled.state';
import { getLayersWithNewLayers } from '../layers/get.layers.with.new.layers';
import { getLayersWithPaletteEntryLink } from '../layers/get.layers.with.palette.entry.link';
import { getLayersWithSettings } from '../layers/get.layers.with.settings';
import { getUsedLayerKeys } from '../layers/get.used.layer.keys';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { getObjectWithTransform } from '../project/get.object.with.transform';
import { getObjectsWithSvgText } from '../project/get.objects.with.svg.text';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { MAX_UNDO_STEPS } from '../project/project.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { LayerKeysPayload } from './interfaces/LayerKeysPayload';
import type { LayerPaletteEntryLinkedPayload } from './interfaces/LayerPaletteEntryLinkedPayload';
import type { LayerSettingsChangedPayload } from './interfaces/LayerSettingsChangedPayload';
import type { LayerToggledPayload } from './interfaces/LayerToggledPayload';
import type { ProjectDocumentPayload } from './interfaces/ProjectDocumentPayload';
import type { ProjectMaterialSelectedPayload } from './interfaces/ProjectMaterialSelectedPayload';
import type { ProjectObjectIdsPayload } from './interfaces/ProjectObjectIdsPayload';
import type { ProjectObjectSvgTextChangedPayload } from './interfaces/ProjectObjectSvgTextChangedPayload';
import type { ProjectObjectSvgTextPayload } from './interfaces/ProjectObjectSvgTextPayload';
import type { ProjectObjectTransformsPayload } from './interfaces/ProjectObjectTransformsPayload';
import type { ProjectObjectsPayload } from './interfaces/ProjectObjectsPayload';
import type { SvgFilesPayload } from './interfaces/SvgFilesPayload';

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

/** Unlike ProjectObjectsAdded, its layers replace the document's: the sample may move a layer to burn the cut last. */
export class SampleJobAdded extends Action<ProjectObjectsPayload> {
  public static readonly type: string = actionType('sample job added');
}

export class ProjectObjectsTransformed extends Action<ProjectObjectTransformsPayload> {
  public static readonly type: string = actionType('project objects transformed');
}

export class ProjectObjectsDeleted extends Action<ProjectObjectIdsPayload> {
  public static readonly type: string = actionType('project objects deleted');
}

/** An element tree edit: turning content off or on, deleting it, or giving it another colour. */
export class ProjectObjectSvgTextChangeRequested extends Action<ProjectObjectSvgTextPayload> {
  public static readonly type: string = actionType('project object svg text change requested');
}

export class ProjectObjectSvgTextChanged extends Action<ProjectObjectSvgTextChangedPayload> {
  public static readonly type: string = actionType('project object svg text changed');
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

export class LayerSettingsChanged extends Action<LayerSettingsChangedPayload> {
  public static readonly type: string = actionType('layer settings changed');
}

export class LayerToggled extends Action<LayerToggledPayload> {
  public static readonly type: string = actionType('layer toggled');
}

export class LayersReordered extends Action<LayerKeysPayload> {
  public static readonly type: string = actionType('layers reordered');
}

export class LayerPaletteEntryLinked extends Action<LayerPaletteEntryLinkedPayload> {
  public static readonly type: string = actionType('layer palette entry linked');
}

export class ProjectMaterialSelected extends Action<ProjectMaterialSelectedPayload> {
  public static readonly type: string = actionType('project material selected');
}

/** Adds the test sample to the open project as a normal object, in one undo step. */
export class SampleJobAddRequested extends Action {
  public static readonly type: string = actionType('sample job add requested');
}

export class SvgFilesImportRequested extends Action<SvgFilesPayload> {
  public static readonly type: string = actionType('svg files import requested');
}
// #endregion

// #region Initial state
const INITIAL_PROJECT_DOCUMENT_STATE: ProjectDocumentState = {
  document: { objects: [], layers: [] },
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

const getStateWithLayers = (state: ProjectDocumentState, changedLayers: ProjectLayer[]): ProjectDocumentState =>
  changedLayers === state.document.layers
    ? state
    : getStateWithChange(state, { ...state.document, layers: changedLayers });

const getStateWithAddedObjects = (
  state: ProjectDocumentState,
  { objects: addedObjects, layers: derivedLayers }: ProjectObjectsPayload,
): ProjectDocumentState =>
  addedObjects.length
    ? getStateWithChange(state, {
      ...state.document,
      objects: [...state.document.objects, ...addedObjects],
      layers: getLayersWithNewLayers(state.document.layers, derivedLayers),
    })
    : state;

const getStateWithMaterial = (state: ProjectDocumentState, materialId: string): ProjectDocumentState =>
  materialId === state.document.materialId ? state : getStateWithChange(state, { ...state.document, materialId });

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

  return hasChangedObject ? getStateWithChange(state, { ...state.document, objects: transformedObjects }) : state;
};

const getStateWithoutObjects = (state: ProjectDocumentState, objectIds: string[]): ProjectDocumentState => {
  const remainingObjects: ProjectObject[] = state.document.objects.filter(
    (projectObject: ProjectObject): boolean => !objectIds.includes(projectObject.id),
  );

  return remainingObjects.length === state.document.objects.length
    ? state
    : getStateWithChange(state, { ...state.document, objects: remainingObjects });
};

const getStateWithObjectSvgText = (
  state: ProjectDocumentState,
  { objectId, svgText, layers: derivedLayers }: ProjectObjectSvgTextChangedPayload,
): ProjectDocumentState => {
  const changedObjects: ProjectObject[] | undefined = getObjectsWithSvgText(state.document.objects, objectId, svgText);

  return changedObjects
    ? getStateWithChange(state, {
      ...state.document,
      objects: changedObjects,
      layers: getLayersWithNewLayers(state.document.layers, derivedLayers),
    })
    : state;
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

const getStateWithLayerAction = (state: ProjectDocumentState, action: Action<unknown>): ProjectDocumentState => {
  const { layers } = state.document;

  switch (action.type) {
  case LayerSettingsChanged.type: {
    const { layerKey, settings } = (action as LayerSettingsChanged).payload;

    return getStateWithLayers(state, getLayersWithSettings(layers, layerKey, settings));
  }
  case LayerToggled.type: {
    const { layerKey, enabled } = (action as LayerToggled).payload;

    return getStateWithLayers(state, getLayersWithEnabledState(layers, layerKey, enabled));
  }
  case LayerPaletteEntryLinked.type: {
    const { layerKey, paletteEntryId } = (action as LayerPaletteEntryLinked).payload;

    return getStateWithLayers(state, getLayersWithPaletteEntryLink(layers, layerKey, paletteEntryId));
  }
  case LayersReordered.type:
    return getStateWithLayers(state, getLayersInOrder(layers, (action as LayersReordered).payload.layerKeys));
  default:
    return state;
  }
};

export const projectDocumentReducer = (
  state: ProjectDocumentState = INITIAL_PROJECT_DOCUMENT_STATE,
  action: Action<unknown>,
): ProjectDocumentState => {
  switch (action.type) {
  case ProjectObjectsAdded.type:
    return getStateWithAddedObjects(state, (action as ProjectObjectsAdded).payload);
  case SampleJobAdded.type: {
    const { objects, layers } = (action as SampleJobAdded).payload;

    return getStateWithChange(state, { ...state.document, objects: [...state.document.objects, ...objects], layers });
  }
  case ProjectObjectsTransformed.type:
    return getStateWithTransforms(state, (action as ProjectObjectsTransformed).payload.transforms);
  case ProjectObjectsDeleted.type:
    return getStateWithoutObjects(state, (action as ProjectObjectsDeleted).payload.objectIds);
  case ProjectObjectSvgTextChanged.type:
    return getStateWithObjectSvgText(state, (action as ProjectObjectSvgTextChanged).payload);
  case ProjectMaterialSelected.type:
    return getStateWithMaterial(state, (action as ProjectMaterialSelected).payload.materialId);
  case ProjectUndoRequested.type:
    return getStateAfterUndo(state);
  case ProjectRedoRequested.type:
    return getStateAfterRedo(state);
  case ProjectDocumentLoaded.type:
    return { document: (action as ProjectDocumentLoaded).payload.document, past: [], future: [] };
  default:
    return getStateWithLayerAction(state, action);
  }
};
// #endregion

// #region Selectors
type RootState = { [PROJECT_DOCUMENT_STATE_NAME]: ProjectDocumentState };

export const selectProjectDocument = (state: RootState): ProjectDocument =>
  state[PROJECT_DOCUMENT_STATE_NAME].document;

export const selectProjectObjects = (state: RootState): ProjectObject[] =>
  state[PROJECT_DOCUMENT_STATE_NAME].document.objects;

const selectDocumentLayers = (state: RootState): ProjectLayer[] => state[PROJECT_DOCUMENT_STATE_NAME].document.layers;

/** The layers that at least one object draws with, in burn order; layers of colours no object uses are left out. */
export const selectProjectLayers = createSelector(
  [selectProjectObjects, selectDocumentLayers],
  (projectObjects: ProjectObject[], documentLayers: ProjectLayer[]): ProjectLayer[] => {
    const usedLayerKeys: Set<string> = getUsedLayerKeys(projectObjects);

    return documentLayers
      .filter((layer: ProjectLayer): boolean => usedLayerKeys.has(getLayerKey(layer)))
      .sort((firstLayer: ProjectLayer, secondLayer: ProjectLayer): number => firstLayer.order - secondLayer.order);
  },
);

/** The layers that at least one object draws with and that are sent to the laser, in burn order. */
export const selectEnabledProjectLayers = createSelector(
  [selectProjectLayers],
  (projectLayers: ProjectLayer[]): ProjectLayer[] =>
    projectLayers.filter((layer: ProjectLayer): boolean => layer.enabled),
);

export const selectCanUndo = (state: RootState): boolean => !!state[PROJECT_DOCUMENT_STATE_NAME].past.length;

export const selectCanRedo = (state: RootState): boolean => !!state[PROJECT_DOCUMENT_STATE_NAME].future.length;
// #endregion
