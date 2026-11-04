import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT } from '../localization/default.locales';
import type { MaterialPreset } from '../materials/interfaces/MaterialPreset';
import { MATERIAL_PRESET_OPERATION } from '../materials/material.preset.constants';
import { MATERIAL_PRESET_REPOSITORY } from '../materials/material.preset.repository';
import { newMaterialPreset } from '../materials/new.material.preset';
import type { AppToast } from './interfaces/AppToast';
import { watchMaterialPresets } from './material.preset.saga';
import { MaterialPresetDeleted, MaterialPresetSaved, selectMaterialPresets } from './material.preset.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { selectToasts } from './toast.state';

const STORAGE_FAILURE_MESSAGE = 'quota exceeded at /secret/path';
const CHANGED_POWER_WATTS = 7;

const newPresetFixture = (overrides: Partial<MaterialPreset> = {}): MaterialPreset => ({
  ...newMaterialPreset({
    materialId: 'material-a',
    machineProfileId: 'profile-a',
    operation: MATERIAL_PRESET_OPERATION.CUT,
    powerWatts: 10,
    speedMmPerMin: 300,
    passes: 2,
    notes: '',
  }),
  ...overrides,
});

const waitForStoredPresets = async (expectedPresets: MaterialPreset[]): Promise<void> => {
  await vi.waitFor(async (): Promise<void> => {
    expect(await MATERIAL_PRESET_REPOSITORY.listMaterialPresets()).toEqual(expectedPresets);
  });
};

const newLoadedStore = async (): Promise<AppStore> => {
  const readSpy = vi.spyOn(MATERIAL_PRESET_REPOSITORY, 'listMaterialPresets');
  const store: AppStore = newStore();

  await vi.waitFor((): void => {
    expect(readSpy).toHaveBeenCalled();
  });
  await readSpy.mock.results[0]?.value;
  readSpy.mockRestore();

  return store;
};

/** Makes the next read wait, and gives back the function that finishes it. */
const holdPresetRead = (): ((presets: MaterialPreset[]) => void) => {
  let finishRead: (presets: MaterialPreset[]) => void = () => undefined;

  vi.spyOn(MATERIAL_PRESET_REPOSITORY, 'listMaterialPresets').mockImplementationOnce(() =>
    new Promise<MaterialPreset[]>((resolve: (presets: MaterialPreset[]) => void) => {
      finishRead = resolve;
    }));

  return (presets: MaterialPreset[]): void => finishRead(presets);
};

describe(watchMaterialPresets.name, () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await new Promise<void>((resolve: () => void) => {
      setTimeout(resolve, 0);
    });
  });

  it('reloads a saved preset through a second store', async () => {
    const preset: MaterialPreset = newPresetFixture();
    const firstStore: AppStore = await newLoadedStore();

    firstStore.dispatch(new MaterialPresetSaved({ preset }));
    await waitForStoredPresets([preset]);

    const secondStore: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(selectMaterialPresets(secondStore.getState())).toEqual([preset]);
    });
  });

  it('replaces a preset saved again with the same id', async () => {
    const preset: MaterialPreset = newPresetFixture();
    const changedPreset: MaterialPreset = { ...preset, powerWatts: CHANGED_POWER_WATTS };
    const store: AppStore = await newLoadedStore();

    store.dispatch(new MaterialPresetSaved({ preset }));
    store.dispatch(new MaterialPresetSaved({ preset: changedPreset }));

    expect(selectMaterialPresets(store.getState())).toEqual([changedPreset]);
    await waitForStoredPresets([changedPreset]);
  });

  it('removes a deleted preset from the state and storage', async () => {
    const preset: MaterialPreset = newPresetFixture();
    const store: AppStore = await newLoadedStore();

    store.dispatch(new MaterialPresetSaved({ preset }));
    await waitForStoredPresets([preset]);
    store.dispatch(new MaterialPresetDeleted({ presetId: preset.id }));

    expect(selectMaterialPresets(store.getState())).toEqual([]);
    await waitForStoredPresets([]);
  });

  it('shows the fixed toast and not the error text when a store fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const store: AppStore = await newLoadedStore();

    vi.spyOn(MATERIAL_PRESET_REPOSITORY, 'putMaterialPreset').mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));
    store.dispatch(new MaterialPresetSaved({ preset: newPresetFixture() }));

    await vi.waitFor((): void => {
      expect(selectToasts(store.getState()).map((toast: AppToast): string => toast.messageKey))
        .toContain(DEFAULT.TOAST_MATERIAL_PRESET_SAVE_FAILED);
    });
    expect(JSON.stringify(selectToasts(store.getState()))).not.toContain(STORAGE_FAILURE_MESSAGE);
  });

  it('shows the fixed toast when a delete fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const store: AppStore = await newLoadedStore();

    vi.spyOn(MATERIAL_PRESET_REPOSITORY, 'deleteMaterialPreset')
      .mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));
    store.dispatch(new MaterialPresetDeleted({ presetId: 'preset-a' }));

    await vi.waitFor((): void => {
      expect(selectToasts(store.getState()).map((toast: AppToast): string => toast.messageKey))
        .toContain(DEFAULT.TOAST_MATERIAL_PRESET_SAVE_FAILED);
    });
  });

  it('keeps a save and does not bring back a delete made while the load is reading', async () => {
    const deletedPreset: MaterialPreset = newPresetFixture();
    const untouchedPreset: MaterialPreset = newPresetFixture();
    const storedPreset: MaterialPreset = newPresetFixture();
    const changedPreset: MaterialPreset = { ...storedPreset, powerWatts: CHANGED_POWER_WATTS };
    const finishRead = holdPresetRead();

    vi.spyOn(MATERIAL_PRESET_REPOSITORY, 'putMaterialPreset').mockResolvedValue();
    vi.spyOn(MATERIAL_PRESET_REPOSITORY, 'deleteMaterialPreset').mockResolvedValue();

    const store: AppStore = newStore();

    store.dispatch(new MaterialPresetSaved({ preset: changedPreset }));
    store.dispatch(new MaterialPresetDeleted({ presetId: deletedPreset.id }));
    finishRead([deletedPreset, untouchedPreset, storedPreset]);

    await vi.waitFor((): void => {
      expect(selectMaterialPresets(store.getState())).toEqual([untouchedPreset, changedPreset]);
    });
  });

  it('logs a failed load and still stores later saves', async () => {
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const preset: MaterialPreset = newPresetFixture();

    vi.spyOn(MATERIAL_PRESET_REPOSITORY, 'listMaterialPresets')
      .mockRejectedValueOnce(new Error(STORAGE_FAILURE_MESSAGE));

    const store: AppStore = newStore();

    await vi.waitFor((): void => {
      expect(logSpy).toHaveBeenCalled();
    });
    store.dispatch(new MaterialPresetSaved({ preset }));
    await waitForStoredPresets([preset]);
  });
});
