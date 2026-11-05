import { describe, expect, it, vi } from 'vitest';
import { DEFAULT } from '../localization/default.locales';
import { getLayerKey } from '../layers/get.layer.key';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { getSampleSvgText } from '../materials/get.sample.svg.text';
import { SAMPLE_CUT_COLOUR, SAMPLE_GRADIENT_ID, SAMPLE_OBJECT_NAME, SAMPLE_SIZE_MM } from '../materials/sample.job.constants';
import { CUT_ENTRY_ID, DEFAULT_PALETTE, LAYER_MODE } from '../palette/palette.constants';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import {
  ProjectDocumentLoaded,
  ProjectRedoRequested,
  ProjectUndoRequested,
  SampleJobAddRequested,
  selectProjectDocument,
  selectProjectLayers,
  selectProjectObjects,
} from './project.document.state';
import { selectSelectedObjectIds } from './project.selection.state';
import { addSampleJob } from './sample.job.add.saga';
import { selectToasts } from './toast.state';

const CHANGED_SPEED_MM_PER_MIN = 123;
const REPEATED_SAMPLE_COUNT = 3;
const OTHER_OBJECT: ProjectObject = newProjectObject({
  name: 'Keep me',
  svgText: getSampleSvgText({ cutColour: SAMPLE_CUT_COLOUR, hasGradient: false }),
});
const SHADED_OBJECT: ProjectObject = newProjectObject({
  name: 'Shaded',
  svgText: getSampleSvgText({ cutColour: SAMPLE_CUT_COLOUR, hasGradient: true }),
});

const waitForObjectCount = async (store: AppStore, objectCount: number): Promise<void> => {
  await vi.waitFor((): void => {
    expect(selectProjectObjects(store.getState())).toHaveLength(objectCount);
  });
};

const getLayerOfKey = (store: AppStore, layerKey: string): ProjectLayer | undefined =>
  selectProjectDocument(store.getState()).layers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey,
  );

describe(addSampleJob.name, () => {
  it('reports the sample in a toast that offers Undo, and offsets a repeated sample', async () => {
    const store: AppStore = newStore();

    store.dispatch(new SampleJobAddRequested());
    await waitForObjectCount(store, 1);
    store.dispatch(new SampleJobAddRequested());
    await waitForObjectCount(store, 2);

    const [first, second] = selectProjectObjects(store.getState());

    expect(selectToasts(store.getState())).toEqual(expect.arrayContaining([
      expect.objectContaining({ messageKey: DEFAULT.TOAST_SAMPLE_ADDED, isUndoOffered: true }),
    ]));
    expect([second?.xMm, second?.yMm]).not.toEqual([first?.xMm, first?.yMm]);
  });

  it('adds a selected 50 mm object, with a new Line layer for the square and Fill for the gradient', async () => {
    const store: AppStore = newStore();

    store.dispatch(new SampleJobAddRequested());
    await waitForObjectCount(store, 1);

    const [sampleObject] = selectProjectObjects(store.getState());

    expect(sampleObject).toMatchObject({ name: SAMPLE_OBJECT_NAME, widthMm: SAMPLE_SIZE_MM, heightMm: SAMPLE_SIZE_MM });
    expect(selectSelectedObjectIds(store.getState())).toEqual([sampleObject?.id]);
    expect(getLayerOfKey(store, SAMPLE_CUT_COLOUR)?.settings.mode).toBe(LAYER_MODE.LINE);
    expect(getLayerOfKey(store, SHADING_LAYER_COLOUR)?.settings.mode).toBe(LAYER_MODE.FILL);
  });

  it('keeps existing objects, and takes a new Line layer when the red layer is off or in Fill', async () => {
    const store: AppStore = newStore();
    const redLayer: ProjectLayer = getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 0);
    const changedRedLayer: ProjectLayer = {
      ...redLayer,
      enabled: false,
      settings: { ...redLayer.settings, mode: LAYER_MODE.FILL, speedMmPerMin: CHANGED_SPEED_MM_PER_MIN },
    };

    store.dispatch(new ProjectDocumentLoaded({ document: { objects: [OTHER_OBJECT], layers: [changedRedLayer] } }));
    store.dispatch(new SampleJobAddRequested());
    await waitForObjectCount(store, 2);

    const { layers } = selectProjectDocument(store.getState());
    const sampleLayer: ProjectLayer | undefined = layers.find((layer: ProjectLayer): boolean =>
      !layer.isShading && layer.colour !== SAMPLE_CUT_COLOUR);

    expect(selectProjectObjects(store.getState())[0]).toEqual(OTHER_OBJECT);
    expect(getLayerOfKey(store, SAMPLE_CUT_COLOUR)).toEqual(changedRedLayer);
    expect(sampleLayer).toMatchObject({ enabled: true, settings: { mode: LAYER_MODE.LINE } });
    expect(selectProjectObjects(store.getState())[1]?.svgText).toContain(`stroke="${sampleLayer?.colour}"`);
  });

  const addSamples = async (store: AppStore, sampleCount: number): Promise<void> => {
    const startCount: number = selectProjectObjects(store.getState()).length;

    for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex++) {
      store.dispatch(new SampleJobAddRequested());
      await waitForObjectCount(store, startCount + sampleIndex);
    }
  };

  const getLayerKeysInBurnOrder = (store: AppStore): string[] =>
    selectProjectLayers(store.getState()).map(getLayerKey);

  it('stays on one red layer over repeated samples in a project that already burns red', async () => {
    const store: AppStore = newStore();

    store.dispatch(new ProjectDocumentLoaded({
      document: { objects: [OTHER_OBJECT], layers: [getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 0)] },
    }));
    await addSamples(store, REPEATED_SAMPLE_COUNT);

    expect(getLayerKeysInBurnOrder(store)).toEqual([SHADING_LAYER_COLOUR, SAMPLE_CUT_COLOUR]);
  });

  it('takes the Cut layer afresh when the red layer is hidden and in Fill', async () => {
    const store: AppStore = newStore();
    const redLayer: ProjectLayer = getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 0);

    store.dispatch(new ProjectDocumentLoaded({
      document: { objects: [], layers: [{ ...redLayer, settings: { ...redLayer.settings, mode: LAYER_MODE.FILL } }] },
    }));
    await addSamples(store, 1);

    expect(getLayerKeysInBurnOrder(store)).toEqual([SHADING_LAYER_COLOUR, SAMPLE_CUT_COLOUR]);
    expect(getLayerOfKey(store, SAMPLE_CUT_COLOUR)).toMatchObject({
      paletteEntryId: redLayer.paletteEntryId,
      settings: { mode: LAYER_MODE.LINE },
    });
  });

  it('repairs shading and red left on one order, and joins red again', async () => {
    const store: AppStore = newStore();

    store.dispatch(new ProjectDocumentLoaded({
      document: {
        objects: [SHADED_OBJECT],
        layers: [
          getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 0),
          getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0),
        ],
      },
    }));
    await addSamples(store, 1);

    expect(getLayerKeysInBurnOrder(store)).toEqual([SHADING_LAYER_COLOUR, SAMPLE_CUT_COLOUR]);
  });

  it('names its own colour Cut and reuses that one layer while the visible red layer cannot be used', async () => {
    const store: AppStore = newStore();
    const redLayer: ProjectLayer = getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 0);

    store.dispatch(new ProjectDocumentLoaded({
      document: {
        objects: [OTHER_OBJECT],
        layers: [{ ...redLayer, settings: { ...redLayer.settings, mode: LAYER_MODE.FILL } }],
      },
    }));
    await addSamples(store, REPEATED_SAMPLE_COUNT);

    const extraLayers: ProjectLayer[] = selectProjectLayers(store.getState()).filter(
      (layer: ProjectLayer): boolean => !layer.isShading && layer.colour !== SAMPLE_CUT_COLOUR,
    );

    expect(extraLayers).toHaveLength(1);
    expect(extraLayers[0]?.paletteEntryId).toBe(CUT_ENTRY_ID);
  });

  it('leaves the gradient out and says so when the shading layer is off', async () => {
    const store: AppStore = newStore();
    const shadingLayer: ProjectLayer = { ...getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0), enabled: false };

    store.dispatch(new ProjectDocumentLoaded({
      document: {
        objects: [SHADED_OBJECT],
        layers: [shadingLayer, getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 1)],
      },
    }));
    store.dispatch(new SampleJobAddRequested());
    await waitForObjectCount(store, 2);

    expect(selectProjectObjects(store.getState())[1]?.svgText).not.toContain(SAMPLE_GRADIENT_ID);
    expect(getLayerOfKey(store, SHADING_LAYER_COLOUR)).toEqual(shadingLayer);
    expect(selectToasts(store.getState()).map(({ messageKey }) => messageKey))
      .toContain(DEFAULT.TOAST_SAMPLE_WITHOUT_GRADIENT);
  });

  it('is one undo step that takes the object away, and redo brings it back', async () => {
    const store: AppStore = newStore();

    store.dispatch(new SampleJobAddRequested());
    await waitForObjectCount(store, 1);
    store.dispatch(new ProjectUndoRequested());

    expect(selectProjectObjects(store.getState())).toEqual([]);
    expect(selectProjectDocument(store.getState()).layers).toEqual([]);

    store.dispatch(new ProjectRedoRequested());

    expect(selectProjectObjects(store.getState())).toHaveLength(1);
  });
});
