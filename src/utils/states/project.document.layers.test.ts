import { describe, expect, it } from 'vitest';
import { getLayerKey } from '../layers/get.layer.key';
import { getObjectsDerivedLayers } from '../layers/get.objects.derived.layers';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import {
  DEFAULT_CUT_ENTRY,
  DEFAULT_PALETTE,
  DEFAULT_SCORE_ENTRY,
  DEFAULT_SHADING_ENTRY,
  PASSES_MAX,
  POWER_PERCENT_MAX,
} from '../palette/palette.constants';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import { Action } from './action';
import {
  LayerSettingsChanged,
  LayerToggled,
  LayersReordered,
  PROJECT_DOCUMENT_STATE_NAME,
  ProjectObjectsAdded,
  ProjectObjectsDeleted,
  ProjectRedoRequested,
  ProjectUndoRequested,
  projectDocumentReducer,
  selectProjectLayers,
} from './project.document.state';
import type { ProjectDocumentState } from './project.document.state';

const RED = DEFAULT_CUT_ENTRY.colour;
const BLUE = DEFAULT_SCORE_ENTRY.colour;
const UNKNOWN_LAYER_KEY = '#123456';
const CHANGED_POWER_PERCENT = 40;
const OVER_MAX_POWER_PERCENT = 150;
const OVER_MAX_PASSES = 99;

class UnknownAction extends Action {
  public static readonly type: string = 'unknown action';
}

const newColouredObject = (colour: string): ProjectObject => newProjectObject({
  svgText: `<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm"><rect fill="${colour}" width="5" height="5"/></svg>`,
});

const getInitialState = (): ProjectDocumentState => projectDocumentReducer(undefined, new UnknownAction());

const getStateWithAddedObjects = (state: ProjectDocumentState, objects: ProjectObject[]): ProjectDocumentState =>
  projectDocumentReducer(state, new ProjectObjectsAdded({
    objects,
    layers: getObjectsDerivedLayers([...state.document.objects, ...objects], DEFAULT_PALETTE, state.document.layers),
  }));

const getVisibleLayers = (state: ProjectDocumentState): ProjectLayer[] =>
  selectProjectLayers({ [PROJECT_DOCUMENT_STATE_NAME]: state });

const getVisibleKeys = (state: ProjectDocumentState): string[] => getVisibleLayers(state).map(getLayerKey);

const getDocumentLayer = (state: ProjectDocumentState, layerKey: string): ProjectLayer | undefined =>
  state.document.layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey);

describe(LayerToggled.name, () => {
  it('switches a layer as one undo step, and undo restores it', () => {
    const before: ProjectDocumentState = getStateWithAddedObjects(getInitialState(), [newColouredObject(RED)]);
    const toggled: ProjectDocumentState = projectDocumentReducer(
      before,
      new LayerToggled({ layerKey: RED, enabled: false }),
    );

    expect(getDocumentLayer(toggled, RED)?.enabled).toBe(false);
    expect(toggled.past).toHaveLength(before.past.length + 1);

    const undone: ProjectDocumentState = projectDocumentReducer(toggled, new ProjectUndoRequested());

    expect(getDocumentLayer(undone, RED)?.enabled).toBe(true);
    expect(projectDocumentReducer(undone, new ProjectRedoRequested()).document).toBe(toggled.document);
  });

  it('makes no undo step for the current value or an unknown layer', () => {
    const state: ProjectDocumentState = getStateWithAddedObjects(getInitialState(), [newColouredObject(RED)]);

    expect(projectDocumentReducer(state, new LayerToggled({ layerKey: RED, enabled: true }))).toBe(state);
    expect(projectDocumentReducer(state, new LayerToggled({ layerKey: UNKNOWN_LAYER_KEY, enabled: false })))
      .toBe(state);
  });
});

describe(ProjectObjectsAdded.name, () => {
  it('stores the layers of the added colours in the same undo step as the objects', () => {
    const state: ProjectDocumentState = getStateWithAddedObjects(
      getInitialState(),
      [newColouredObject(RED), newColouredObject(BLUE)],
    );

    expect(state.document.layers.map((layer: ProjectLayer) => layer.paletteEntryId).sort())
      .toEqual([DEFAULT_CUT_ENTRY.id, DEFAULT_SCORE_ENTRY.id].sort());
    expect(state.past).toEqual([{ objects: [], layers: [] }]);
  });

  it('keeps the settings of an existing layer when the payload brings a stale copy of it', () => {
    const changed: ProjectDocumentState = projectDocumentReducer(
      getStateWithAddedObjects(getInitialState(), [newColouredObject(RED)]),
      new LayerSettingsChanged({ layerKey: RED, settings: { maxPowerPercent: CHANGED_POWER_PERCENT } }),
    );
    const staleLayers: ProjectLayer[] = getObjectsDerivedLayers([newColouredObject(RED)], DEFAULT_PALETTE, []);
    const added: ProjectDocumentState = projectDocumentReducer(
      changed,
      new ProjectObjectsAdded({ objects: [newColouredObject(RED)], layers: staleLayers }),
    );

    expect(getDocumentLayer(added, RED)?.settings.maxPowerPercent).toBe(CHANGED_POWER_PERCENT);
  });
});

describe(selectProjectLayers.name, () => {
  it('hides the layer of a deleted colour, and undo brings it back with its changed settings', () => {
    const redObject: ProjectObject = newColouredObject(RED);
    const changed: ProjectDocumentState = projectDocumentReducer(
      getStateWithAddedObjects(getInitialState(), [redObject, newColouredObject(BLUE)]),
      new LayerSettingsChanged({ layerKey: RED, settings: { maxPowerPercent: CHANGED_POWER_PERCENT } }),
    );
    const deleted: ProjectDocumentState = projectDocumentReducer(
      changed,
      new ProjectObjectsDeleted({ objectIds: [redObject.id] }),
    );

    expect(getVisibleKeys(deleted)).toEqual([BLUE]);
    expect(getDocumentLayer(deleted, RED)?.settings.maxPowerPercent).toBe(CHANGED_POWER_PERCENT);

    const undone: ProjectDocumentState = projectDocumentReducer(deleted, new ProjectUndoRequested());

    expect(getVisibleKeys(undone)).toContain(RED);
    expect(getDocumentLayer(undone, RED)?.settings.maxPowerPercent).toBe(CHANGED_POWER_PERCENT);
  });

  it('lists a grey object under the shading layer, sorted by order', () => {
    const state: ProjectDocumentState = getStateWithAddedObjects(
      getInitialState(),
      [newColouredObject(RED), newColouredObject(DEFAULT_SHADING_ENTRY.colour)],
    );
    const visibleLayers: ProjectLayer[] = getVisibleLayers(state);

    expect(visibleLayers.map((layer: ProjectLayer) => layer.order))
      .toEqual([...visibleLayers.map((layer: ProjectLayer) => layer.order)].sort());
    expect(visibleLayers.some((layer: ProjectLayer) => layer.isShading)).toBe(true);
  });

  it('gives the same list again while the document does not change', () => {
    const state: ProjectDocumentState = getStateWithAddedObjects(getInitialState(), [newColouredObject(RED)]);

    expect(getVisibleLayers(state)).toBe(getVisibleLayers(state));
  });
});

describe(LayerSettingsChanged.name, () => {
  it('clamps the values to the palette ranges', () => {
    const state: ProjectDocumentState = projectDocumentReducer(
      getStateWithAddedObjects(getInitialState(), [newColouredObject(RED)]),
      new LayerSettingsChanged({
        layerKey: RED,
        settings: { maxPowerPercent: OVER_MAX_POWER_PERCENT, passes: OVER_MAX_PASSES },
      }),
    );

    expect(getDocumentLayer(state, RED)?.settings).toMatchObject({
      maxPowerPercent: POWER_PERCENT_MAX,
      passes: PASSES_MAX,
    });
  });

  it('makes no undo step for equal settings, a non-finite value or an unknown layer', () => {
    const state: ProjectDocumentState = getStateWithAddedObjects(getInitialState(), [newColouredObject(RED)]);

    expect(projectDocumentReducer(state, new LayerSettingsChanged({
      layerKey: RED,
      settings: { passes: DEFAULT_CUT_ENTRY.passes },
    }))).toBe(state);
    expect(projectDocumentReducer(state, new LayerSettingsChanged({
      layerKey: RED,
      settings: { speedMmPerMin: Number.NaN },
    }))).toBe(state);
    expect(projectDocumentReducer(state, new LayerSettingsChanged({
      layerKey: UNKNOWN_LAYER_KEY,
      settings: { passes: 2 },
    }))).toBe(state);
  });
});

describe(LayersReordered.name, () => {
  it('orders the listed layers first and keeps hidden layers after them in their old order', () => {
    const redObject: ProjectObject = newColouredObject(RED);
    const withHiddenRed: ProjectDocumentState = projectDocumentReducer(
      getStateWithAddedObjects(getInitialState(), [redObject, newColouredObject(BLUE)]),
      new ProjectObjectsDeleted({ objectIds: [redObject.id] }),
    );
    const withShading: ProjectDocumentState = getStateWithAddedObjects(
      withHiddenRed,
      [newColouredObject(DEFAULT_SHADING_ENTRY.colour)],
    );
    const visibleKeysBefore: string[] = getVisibleKeys(withShading);
    const reversedVisibleKeys: string[] = [...visibleKeysBefore].reverse();
    const reordered: ProjectDocumentState = projectDocumentReducer(
      withShading,
      new LayersReordered({ layerKeys: reversedVisibleKeys }),
    );

    expect(getVisibleKeys(reordered)).toEqual(reversedVisibleKeys);
    expect(getDocumentLayer(reordered, RED)?.order).toBe(reversedVisibleKeys.length);
    expect(reordered.past).toHaveLength(withShading.past.length + 1);
  });

  it('makes no undo step when the order stays the same', () => {
    const state: ProjectDocumentState = getStateWithAddedObjects(
      getInitialState(),
      [newColouredObject(RED), newColouredObject(BLUE)],
    );

    expect(projectDocumentReducer(state, new LayersReordered({ layerKeys: getVisibleKeys(state) }))).toBe(state);
  });
});
