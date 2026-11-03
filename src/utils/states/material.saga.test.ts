import { afterEach, describe, expect, it, vi } from 'vitest';
import { PANEL_SIZES_READ_TIMEOUT_MS } from '../layout.constants';
import { DEFAULT } from '../localization/default.locales';
import type { Material } from '../materials/interfaces/Material';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import { MATERIAL_REPOSITORY } from '../materials/material.repository';
import { newMaterial } from '../materials/new.material';
import type { AppToast } from './interfaces/AppToast';
import { watchMaterials } from './material.saga';
import { MaterialSaved, MaterialTestResultSaved, selectMaterials } from './material.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { selectToasts } from './toast.state';

const RENAMED_NAME = 'Birch 4 mm';
const STORAGE_FAILURE_MESSAGE = 'quota exceeded at /secret/path';

const TEST_RESULT: MaterialTestResult = {
  machineProfileId: 'profile-a',
  powerPercent: 100,
  speedMmPerMin: 300,
  passes: 1,
  thicknessMm: 3,
  outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
  depthMm: undefined,
  testedAtIso: '2026-11-03T10:00:00.000Z',
};

/** A storage read that neither resolves nor rejects, like IndexedDB blocked by another tab. */
const getHangingRead = <TValue>(): Promise<TValue> => new Promise<TValue>(() => undefined);

const waitForStoredMaterials = async (expectedMaterials: Material[]): Promise<void> => {
  await vi.waitFor(async (): Promise<void> => {
    expect(await MATERIAL_REPOSITORY.listMaterials()).toEqual(expectedMaterials);
  });
};

const newLoadedStore = async (): Promise<AppStore> => {
  const readSpy = vi.spyOn(MATERIAL_REPOSITORY, 'listMaterials');
  const store: AppStore = newStore();

  await vi.waitFor((): void => {
    expect(readSpy).toHaveBeenCalled();
  });
  await readSpy.mock.results[0]?.value;
  readSpy.mockRestore();

  return store;
};

describe(watchMaterials.name, () => {
  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise<void>((resolve: () => void) => {
      setTimeout(resolve, 0);
    });
  });

  it('reloads a saved material through a second store', async () => {
    const material: Material = newMaterial();
    const firstStore: AppStore = await newLoadedStore();

    firstStore.dispatch(new MaterialSaved({ material }));
    await waitForStoredMaterials([material]);

    const secondStore: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(selectMaterials(secondStore.getState())).toEqual([material]);
    });
  });

  it('replaces a material saved again with the same id', async () => {
    const material: Material = newMaterial();
    const renamedMaterial: Material = { ...material, name: RENAMED_NAME };
    const store: AppStore = await newLoadedStore();

    store.dispatch(new MaterialSaved({ material }));
    store.dispatch(new MaterialSaved({ material: renamedMaterial }));

    expect(selectMaterials(store.getState())).toEqual([renamedMaterial]);
    await waitForStoredMaterials([renamedMaterial]);
  });

  it('stores a saved test result on its material', async () => {
    const material: Material = newMaterial();
    const store: AppStore = await newLoadedStore();

    store.dispatch(new MaterialSaved({ material }));
    store.dispatch(new MaterialTestResultSaved({ materialId: material.id, testResult: TEST_RESULT }));

    const testedMaterial: Material = { ...material, testResults: [TEST_RESULT] };

    expect(selectMaterials(store.getState())).toEqual([testedMaterial]);
    await waitForStoredMaterials([testedMaterial]);
  });

  it('ignores a test result for an unknown material', async () => {
    const putSpy = vi.spyOn(MATERIAL_REPOSITORY, 'putMaterial');
    const store: AppStore = await newLoadedStore();

    store.dispatch(new MaterialTestResultSaved({ materialId: 'unknown', testResult: TEST_RESULT }));

    expect(selectMaterials(store.getState())).toEqual([]);
    expect(putSpy).not.toHaveBeenCalled();
  });

  it('shows the fixed toast and not the error text when a store fails, and keeps running', async () => {
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const storageError: Error = new Error(STORAGE_FAILURE_MESSAGE);
    const store: AppStore = await newLoadedStore();
    const putSpy = vi.spyOn(MATERIAL_REPOSITORY, 'putMaterial').mockRejectedValueOnce(storageError);

    store.dispatch(new MaterialSaved({ material: newMaterial() }));

    await vi.waitFor((): void => {
      expect(selectToasts(store.getState()).map((toast: AppToast): string => toast.messageKey))
        .toContain(DEFAULT.TOAST_MATERIAL_SAVE_FAILED);
    });
    expect(JSON.stringify(selectToasts(store.getState()))).not.toContain(STORAGE_FAILURE_MESSAGE);
    expect(logSpy).toHaveBeenCalledWith(expect.any(String), storageError);

    const laterMaterial: Material = newMaterial();

    store.dispatch(new MaterialSaved({ material: laterMaterial }));
    await vi.waitFor((): void => {
      expect(putSpy).toHaveBeenCalledWith(laterMaterial);
    });
  });

  it('shows the fixed toast when storing a test result fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const material: Material = newMaterial();
    const store: AppStore = await newLoadedStore();

    store.dispatch(new MaterialSaved({ material }));
    await waitForStoredMaterials([material]);
    vi.spyOn(MATERIAL_REPOSITORY, 'putMaterial').mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));
    store.dispatch(new MaterialTestResultSaved({ materialId: material.id, testResult: TEST_RESULT }));

    await vi.waitFor((): void => {
      expect(selectToasts(store.getState()).map((toast: AppToast): string => toast.messageKey))
        .toContain(DEFAULT.TOAST_MATERIAL_SAVE_FAILED);
    });
  });

  it('logs a failed load and still stores later saves', async () => {
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const material: Material = newMaterial();

    vi.spyOn(MATERIAL_REPOSITORY, 'listMaterials').mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));

    const store: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(logSpy).toHaveBeenCalled();
    });
    store.dispatch(new MaterialSaved({ material }));
    await waitForStoredMaterials([material]);
    expect(selectMaterials(store.getState())).toEqual([material]);
  });

  it('keeps and stores a material saved while the read hangs past the timeout', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const material: Material = newMaterial();
    const readSpy = vi.spyOn(MATERIAL_REPOSITORY, 'listMaterials').mockImplementationOnce(getHangingRead);
    const store: AppStore = newStore();

    store.dispatch(new MaterialSaved({ material }));
    await vi.advanceTimersByTimeAsync(PANEL_SIZES_READ_TIMEOUT_MS);

    expect(readSpy).toHaveBeenCalledTimes(1);
    expect(selectMaterials(store.getState())).toEqual([material]);
    vi.useRealTimers();
    await waitForStoredMaterials([material]);
  });

  it('keeps the newer version of a material saved while the load is reading', async () => {
    const storedMaterial: Material = newMaterial();
    const otherStoredMaterial: Material = newMaterial();
    const renamedMaterial: Material = { ...storedMaterial, name: RENAMED_NAME };
    let finishRead: (materials: Material[]) => void = () => undefined;

    vi.spyOn(MATERIAL_REPOSITORY, 'listMaterials').mockImplementationOnce(() =>
      new Promise<Material[]>((resolve: (materials: Material[]) => void) => {
        finishRead = resolve;
      }));
    vi.spyOn(MATERIAL_REPOSITORY, 'putMaterial').mockResolvedValue();

    const store: AppStore = newStore();

    store.dispatch(new MaterialSaved({ material: renamedMaterial }));
    finishRead([storedMaterial, otherStoredMaterial]);

    await vi.waitFor((): void => {
      expect(selectMaterials(store.getState())).toEqual([renamedMaterial, otherStoredMaterial]);
    });
  });
});
