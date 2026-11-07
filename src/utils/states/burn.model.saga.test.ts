import { afterEach, describe, expect, it, vi } from 'vitest';
import { BED_VIEW_MODE } from '../bed/bed.view.constants';
import { FakeBurnModelWorkerClient } from '../burn.model/test.support/fake.burn.model.worker.client';
import { DEFAULT } from '../localization/default.locales';
import type { Material } from '../materials/interfaces/Material';
import { newMaterial } from '../materials/new.material';
import { newTestResultFixture } from '../materials/new.test.result.fixture';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { BedViewModeChanged } from './bed.view.state';
import { watchBurnModel } from './burn.model.saga';
import { BURN_MODEL_STATUS } from './burn.model.status.constants';
import {
  BurnPartLifted,
  selectBurnModel,
  selectBurnModelStatus,
  selectBurnPartLiftMm,
} from './burn.model.state';
import type { AppToast } from './interfaces/AppToast';
import { LIVE_STORE_TASK_REGISTRY } from './live.store.tasks';
import { ActiveMachineProfileSelected } from './machine.profile.state';
import { MaterialSaved, MaterialTestResultSaved, MaterialsLoaded } from './material.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { LayerToggled, ProjectMaterialSelected } from './project.document.state';
import { selectProjectId } from './project.state';
import { selectToasts } from './toast.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from './toolpath.state';

const THICKNESS_MM = 3;
const OTHER_THICKNESS_MM = 6;
const PART_ID = 1;
const LIFT_MM = 2;
const LAYER_KEY = '#ff0000';
const OTHER_PROFILE_ID = 'other-profile';
const OTHER_MATERIAL_ID = 'other-material';
const FIRST_GENERATION = 0;
const SECOND_GENERATION = 1;
const GENERATION_ERROR = new Error('worker crashed');
const TEST_MATERIAL: Material = newMaterial({ thicknessMm: THICKNESS_MM });

const putReadyToolpath = (store: AppStore): void => {
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({
      moves: [newToolpathMove()],
      bounds: { minX: 0, minY: 0, maxX: 10, maxY: 0 },
    }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));
};

const flushSagas = async (): Promise<void> => {
  await new Promise((resolve: (value: unknown) => void) => {
    setTimeout(resolve);
  });
};

const waitForBurnModelStatus = async (store: AppStore, status: string): Promise<void> => {
  await vi.waitFor((): void => {
    expect(selectBurnModelStatus(store.getState())).toBe(status);
  });
};

/** A store with an open project with a material and a ready toolpath, still in the Design view. */
const newProjectStore = async (burnModelWorkerClient: FakeBurnModelWorkerClient): Promise<AppStore> => {
  const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true), burnModelWorkerClient);

  await vi.waitFor((): void => {
    expect(selectProjectId(store.getState())).toBeDefined();
  });
  store.dispatch(new MaterialSaved({ material: TEST_MATERIAL }));
  store.dispatch(new ProjectMaterialSelected({ materialId: TEST_MATERIAL.id }));
  putReadyToolpath(store);
  await flushSagas();

  return store;
};

const newHeld3dStore = async (client: FakeBurnModelWorkerClient): Promise<AppStore> => {
  const store: AppStore = await newProjectStore(client);

  store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));

  return store;
};

describe(watchBurnModel.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds in the Design view too, so the Cut check count is current in every view', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newProjectStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);

    expect(client.generationInputs).toHaveLength(1);
  });

  it('builds nothing more on entering 3D with a current model', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newProjectStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    await flushSagas();

    expect(client.generationInputs).toHaveLength(1);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.READY);
  });

  it('builds on entering 3D, from the toolpath, layers and the material thickness', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);

    expect(client.generationInputs).toHaveLength(1);
    expect(client.generationInputs[0]?.thicknessMm).toBe(THICKNESS_MM);
    expect(client.generationInputs[0]?.testResult).toBeUndefined();
    expect(selectBurnModel(store.getState())?.thicknessMm).toBe(THICKNESS_MM);
  });

  it('does not build in 3D without a material', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true), client);

    await vi.waitFor((): void => {
      expect(selectProjectId(store.getState())).toBeDefined();
    });
    putReadyToolpath(store);
    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    await flushSagas();

    expect(client.generationInputs).toEqual([]);
  });

  it('does not build while the toolpath is not ready, then builds when it is', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newProjectStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new ToolpathRequested());
    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    await flushSagas();
    expect(client.generationInputs).toHaveLength(1);

    putReadyToolpath(store);
    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    expect(client.generationInputs).toHaveLength(2);
  });

  it('rebuilds on a new toolpath and clears the lifts', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new BurnPartLifted({ partId: PART_ID, liftMm: LIFT_MM }));
    expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBe(LIFT_MM);

    putReadyToolpath(store);
    await flushSagas();

    expect(client.generationInputs).toHaveLength(2);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.READY);
    expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBe(0);
  });

  it('cancels the first build when a second one starts, and takes only the second result', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient(true);
    const store: AppStore = await newHeld3dStore(client);

    putReadyToolpath(store);
    await flushSagas();

    expect(client.cancelledGenerationCount).toBe(1);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.BUILDING);

    client.resolveHeldGeneration(FIRST_GENERATION);
    await flushSagas();
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.BUILDING);

    client.resolveHeldGeneration(SECOND_GENERATION);
    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
  });

  it.each([
    ['a material edit', (): MaterialSaved => new MaterialSaved({ material: TEST_MATERIAL })],
    ['a new test result', (): MaterialTestResultSaved => new MaterialTestResultSaved({
      materialId: TEST_MATERIAL.id,
      testResult: newTestResultFixture(),
    })],
    ['a machine profile selection', (): ActiveMachineProfileSelected => new ActiveMachineProfileSelected({
      profileId: OTHER_PROFILE_ID,
    })],
  ])('rebuilds on %s while the toolpath stays ready', async (_title, newAction) => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(newAction());
    await flushSagas();

    expect(client.generationInputs).toHaveLength(2);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.READY);
  });

  it.each([
    ['a save of another material', (): MaterialSaved => new MaterialSaved({ material: newMaterial() })],
    ['a test result of another material', (): MaterialTestResultSaved => new MaterialTestResultSaved({
      materialId: OTHER_MATERIAL_ID,
      testResult: newTestResultFixture(),
    })],
    ['a selection of the same material', (): ProjectMaterialSelected => new ProjectMaterialSelected({
      materialId: TEST_MATERIAL.id,
    })],
    ['the materials being read again', (): MaterialsLoaded => new MaterialsLoaded({ materials: [TEST_MATERIAL] })],
  ])('keeps a ready model, its lifts and its status on %s', async (_title, newAction) => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new BurnPartLifted({ partId: PART_ID, liftMm: LIFT_MM }));
    store.dispatch(newAction());
    await flushSagas();

    expect(client.generationInputs).toHaveLength(1);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.READY);
    expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBe(LIFT_MM);
  });

  it.each([
    ['a save of another material', (): MaterialSaved => new MaterialSaved({ material: newMaterial() })],
    ['a selection of the same material', (): ProjectMaterialSelected => new ProjectMaterialSelected({
      materialId: TEST_MATERIAL.id,
    })],
    ['the materials being read again', (): MaterialsLoaded => new MaterialsLoaded({ materials: [TEST_MATERIAL] })],
  ])('does not restart a running build on %s', async (_title, newAction) => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient(true);
    const store: AppStore = await newHeld3dStore(client);

    store.dispatch(newAction());
    await flushSagas();

    expect(client.cancelledGenerationCount).toBe(0);
    expect(client.generationInputs).toHaveLength(1);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.BUILDING);
  });

  it('builds when the materials arrive after 3D opened', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true), client);

    await vi.waitFor((): void => {
      expect(selectProjectId(store.getState())).toBeDefined();
    });
    store.dispatch(new ProjectMaterialSelected({ materialId: TEST_MATERIAL.id }));
    putReadyToolpath(store);
    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    await flushSagas();
    expect(client.generationInputs).toEqual([]);

    store.dispatch(new MaterialsLoaded({ materials: [TEST_MATERIAL] }));
    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);

    expect(client.generationInputs).toHaveLength(1);
    expect(client.generationInputs[0]?.thicknessMm).toBe(THICKNESS_MM);
  });

  it('rebuilds on selecting another material', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);
    const otherMaterial: Material = newMaterial({ thicknessMm: OTHER_THICKNESS_MM });

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new MaterialSaved({ material: otherMaterial }));
    store.dispatch(new ProjectMaterialSelected({ materialId: otherMaterial.id }));
    await flushSagas();

    expect(client.generationInputs).toHaveLength(2);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.READY);
  });

  it('builds with the thickness of the newly selected material', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);
    const thickerMaterial: Material = newMaterial({ thicknessMm: OTHER_THICKNESS_MM });

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new MaterialSaved({ material: thickerMaterial }));
    store.dispatch(new ProjectMaterialSelected({ materialId: thickerMaterial.id }));
    await flushSagas();

    expect(client.generationInputs.at(-1)?.thicknessMm).toBe(OTHER_THICKNESS_MM);
  });

  it('makes a ready model stale on a document change, with no build until the toolpath is ready', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new LayerToggled({ layerKey: LAYER_KEY, enabled: false }));
    await flushSagas();

    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.STALE);
    expect(client.generationInputs).toHaveLength(1);
  });

  it('cancels a running build when the document changes, so an old result never looks ready', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient(true);
    const store: AppStore = await newHeld3dStore(client);

    store.dispatch(new LayerToggled({ layerKey: LAYER_KEY, enabled: false }));
    await flushSagas();

    expect(client.cancelledGenerationCount).toBe(1);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.IDLE);
  });

  it('keeps a running build on leaving 3D', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient(true);
    const store: AppStore = await newHeld3dStore(client);

    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.DESIGN }));
    await flushSagas();

    expect(client.cancelledGenerationCount).toBe(0);
    expect(selectBurnModelStatus(store.getState())).toBe(BURN_MODEL_STATUS.BUILDING);
  });

  it('keeps the model and its lifts when the view leaves 3D and comes back', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new BurnPartLifted({ partId: PART_ID, liftMm: LIFT_MM }));
    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.DESIGN }));
    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    await flushSagas();

    expect(client.generationInputs).toHaveLength(1);
    expect(selectBurnPartLiftMm(PART_ID)(store.getState())).toBe(LIFT_MM);
  });

  it('rebuilds at once after a material edit in another view', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();
    const store: AppStore = await newHeld3dStore(client);

    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.DESIGN }));
    store.dispatch(new MaterialSaved({ material: TEST_MATERIAL }));
    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.READY);
    store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.THREE_D }));
    await flushSagas();

    expect(client.generationInputs).toHaveLength(2);
  });

  it('disposes the client when the store stops', async () => {
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient();

    await newProjectStore(client);
    LIVE_STORE_TASK_REGISTRY.cancelLiveStoreTasks();

    expect(client.disposeCount).toBe(1);
  });

  it('logs a failure and shows the fixed toast without the error text', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const client: FakeBurnModelWorkerClient = new FakeBurnModelWorkerClient(true);
    const store: AppStore = await newHeld3dStore(client);

    client.rejectHeldGeneration(FIRST_GENERATION, GENERATION_ERROR);
    await waitForBurnModelStatus(store, BURN_MODEL_STATUS.FAILED);

    expect(selectToasts(store.getState()).map((toast: AppToast) => [toast.messageKey, toast.messageParameters]))
      .toEqual([[DEFAULT.TOAST_BURN_MODEL_FAILED, {}]]);
    expect(consoleSpy.mock.calls.some((call: unknown[]) => call.includes(GENERATION_ERROR))).toBe(true);
  });
});
