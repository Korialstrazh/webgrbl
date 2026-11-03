import { BED_VIEW_MODE } from '../bed/bed.view.constants';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { Material } from '../materials/interfaces/Material';
import { newMaterial } from '../materials/new.material';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { BedViewModeChanged } from './bed.view.state';
import { BURN_PREVIEW_EMPTY_STATE } from './burn.preview.empty.state.constants';
import { selectBurnPreviewEmptyState } from './burn.preview.selectors';
import { BurnModelFailed, BurnModelReady, BurnModelRequested } from './burn.model.state';
import { MaterialSaved } from './material.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ProjectMaterialSelected } from './project.document.state';
import { ToolpathReady, ToolpathRequested, selectToolpathDocumentVersion } from './toolpath.state';

const MATERIAL: Material = newMaterial();
const MODEL: BurnModel = {
  parts: [],
  cutCheck: { freePartCount: 0, borderlinePartCount: 0, attachedPartCount: 0, warnings: [], isGuess: true },
  meshes: [],
  sheetBounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  thicknessMm: 3,
};

/** A store held in the Toolpath view, so nothing builds by itself, with a material and a ready toolpath. */
const newMaterialStore = (): AppStore => {
  const store: AppStore = newStore(undefined, new FakeToolpathWorkerClient(true));

  store.dispatch(new BedViewModeChanged({ viewMode: BED_VIEW_MODE.TOOLPATH }));
  store.dispatch(new MaterialSaved({ material: MATERIAL }));
  store.dispatch(new ProjectMaterialSelected({ materialId: MATERIAL.id }));
  store.dispatch(new ToolpathRequested());
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath(),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store;
};

describe(selectBurnPreviewEmptyState.name, () => {
  it('is undefined for a current model', () => {
    const store: AppStore = newMaterialStore();

    store.dispatch(new BurnModelReady({ model: MODEL }));

    expect(selectBurnPreviewEmptyState(store.getState())).toBeUndefined();
  });

  it('asks for a material when there is none', () => {
    expect(selectBurnPreviewEmptyState(newStore().getState())).toBe(BURN_PREVIEW_EMPTY_STATE.NO_MATERIAL);
  });

  it('is out of date while the toolpath is not ready', () => {
    const store: AppStore = newMaterialStore();

    store.dispatch(new ToolpathRequested());

    expect(selectBurnPreviewEmptyState(store.getState())).toBe(BURN_PREVIEW_EMPTY_STATE.OUT_OF_DATE);
  });

  it('is out of date for a stale model even when the toolpath is ready', () => {
    const store: AppStore = newMaterialStore();

    store.dispatch(new BurnModelRequested({ materialId: MATERIAL.id }));
    store.dispatch(new BurnModelReady({ model: MODEL }));
    store.dispatch(new MaterialSaved({ material: MATERIAL }));

    expect(selectBurnPreviewEmptyState(store.getState())).toBe(BURN_PREVIEW_EMPTY_STATE.OUT_OF_DATE);
  });

  it('is building while a build runs, and when one is about to start', () => {
    const store: AppStore = newMaterialStore();

    expect(selectBurnPreviewEmptyState(store.getState())).toBe(BURN_PREVIEW_EMPTY_STATE.BUILDING);

    store.dispatch(new BurnModelRequested({ materialId: MATERIAL.id }));

    expect(selectBurnPreviewEmptyState(store.getState())).toBe(BURN_PREVIEW_EMPTY_STATE.BUILDING);
  });

  it('is failed after a failed build, until the toolpath goes out of date', () => {
    const store: AppStore = newMaterialStore();

    store.dispatch(new BurnModelFailed());
    expect(selectBurnPreviewEmptyState(store.getState())).toBe(BURN_PREVIEW_EMPTY_STATE.FAILED);

    store.dispatch(new ToolpathRequested());
    expect(selectBurnPreviewEmptyState(store.getState())).toBe(BURN_PREVIEW_EMPTY_STATE.OUT_OF_DATE);
  });
});
