import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_CUT_ENTRY, DEFAULT_SCORE_ENTRY } from '../palette/palette.constants';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import type { StoredProject } from '../project/interfaces/StoredProject';
import { newProjectObject } from '../project/new.project.object';
import { AUTOSAVE_DEBOUNCE_MS } from '../project/project.constants';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { WEBGRBL_DATABASE } from '../project/webgrbl.database';
import { SVG_MIME_TYPE } from '../svg/svg.constants';
import { useStorageSafeFakeTimers } from '../test.support/use.storage.safe.fake.timers';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import {
  LayerSettingsChanged,
  LayerToggled,
  ProjectUndoRequested,
  SvgFilesImportRequested,
  selectProjectDocument,
  selectProjectLayers,
} from './project.document.state';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import { selectProjectId, selectProjectSaveStatus } from './project.state';

const RED = DEFAULT_CUT_ENTRY.colour;
const BLUE = DEFAULT_SCORE_ENTRY.colour;
const RED_AND_BLUE_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm">'
  + `<rect fill="${RED}" width="5" height="5"/><circle stroke="${BLUE}" fill="none" r="3"/></svg>`;
const CHANGED_POWER_PERCENT = 35;
const OLD_PROJECT_NAME = 'Made before layers';

const newStartedStore = async (): Promise<AppStore> => {
  const store: AppStore = newStore();

  await vi.waitFor((): void => {
    expect(selectProjectId(store.getState())).toBeDefined();
  });

  return store;
};

const importRedAndBlueSvg = async (store: AppStore): Promise<void> => {
  store.dispatch(new SvgFilesImportRequested({
    files: [new File([RED_AND_BLUE_SVG_TEXT], 'red-blue.svg', { type: SVG_MIME_TYPE })],
  }));
  await vi.waitFor((): void => {
    expect(selectProjectDocument(store.getState()).objects).toHaveLength(1);
  });
};

const getVisibleLayer = (store: AppStore, layerKey: string): ProjectLayer | undefined =>
  selectProjectLayers(store.getState()).find((layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey);

const autosave = async (store: AppStore): Promise<void> => {
  await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
  await vi.waitFor((): void => {
    expect(selectProjectSaveStatus(store.getState())).toBe(PROJECT_SAVE_STATUS.SAVED);
  });
};

describe('project layers', () => {
  beforeEach(() => {
    useStorageSafeFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('gives a red and blue SVG Cut and Score layers, removed again by one undo', async () => {
    const store: AppStore = await newStartedStore();

    await importRedAndBlueSvg(store);

    expect(selectProjectLayers(store.getState()).map((layer: ProjectLayer) => layer.paletteEntryId))
      .toEqual([DEFAULT_CUT_ENTRY.id, DEFAULT_SCORE_ENTRY.id]);

    store.dispatch(new ProjectUndoRequested());

    expect(selectProjectDocument(store.getState())).toEqual({ objects: [], layers: [] });
  });

  it('marks a layer change unsaved and autosaves it', async () => {
    const store: AppStore = await newStartedStore();

    await importRedAndBlueSvg(store);
    await autosave(store);
    store.dispatch(new LayerToggled({ layerKey: BLUE, enabled: false }));

    expect(selectProjectSaveStatus(store.getState())).toBe(PROJECT_SAVE_STATUS.UNSAVED);

    await autosave(store);
    const storedProject: LoadedProject | undefined =
      await PROJECT_REPOSITORY.getProject(selectProjectId(store.getState()) ?? '');

    expect(storedProject?.document.layers.find((layer: ProjectLayer) => getLayerKey(layer) === BLUE)?.enabled)
      .toBe(false);
  });

  it('keeps the layer settings after a reload through a second store', async () => {
    const firstStore: AppStore = await newStartedStore();

    await importRedAndBlueSvg(firstStore);
    firstStore.dispatch(new LayerSettingsChanged({
      layerKey: RED,
      settings: { maxPowerPercent: CHANGED_POWER_PERCENT },
    }));
    await autosave(firstStore);
    const savedLayers: ProjectLayer[] = selectProjectLayers(firstStore.getState());

    const secondStore: AppStore = await newStartedStore();

    await vi.waitFor((): void => {
      expect(selectProjectLayers(secondStore.getState())).toEqual(savedLayers);
    });
    expect(getVisibleLayer(secondStore, RED)?.settings.maxPowerPercent).toBe(CHANGED_POWER_PERCENT);
  });

  it('derives the layers of a project stored without layers when it opens', async () => {
    const storedProject: StoredProject = await PROJECT_REPOSITORY.createProject(OLD_PROJECT_NAME);
    const redObject: ProjectObject = newProjectObject({ svgText: RED_AND_BLUE_SVG_TEXT });
    const { svgText, ...storedObject } = redObject;

    await WEBGRBL_DATABASE.svgAssets.put({ objectId: redObject.id, projectId: storedProject.id, svgText });
    await WEBGRBL_DATABASE.projects.put({ ...storedProject, objects: [storedObject], layers: undefined });
    await PROJECT_REPOSITORY.setLastOpenedProjectId(storedProject.id);

    const store: AppStore = await newStartedStore();

    expect(selectProjectId(store.getState())).toBe(storedProject.id);
    expect(getVisibleLayer(store, RED)?.paletteEntryId).toBe(DEFAULT_CUT_ENTRY.id);
    expect(getVisibleLayer(store, BLUE)?.paletteEntryId).toBe(DEFAULT_SCORE_ENTRY.id);
  });
});
