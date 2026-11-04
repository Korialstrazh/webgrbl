/**
 * Keeps the material presets in step with storage: reads them at start and stores every change at once. A read that
 * fails or hangs keeps the presets in the state. A failed store or delete logs the error and shows a fixed toast.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, delay, put, race, select, takeEvery } from 'redux-saga/effects';
import { PANEL_SIZES_READ_TIMEOUT_MS } from '../layout.constants';
import { DEFAULT } from '../localization/default.locales';
import { getStoredPresetsWithChanges } from '../materials/get.stored.presets.with.changes';
import type { MaterialPreset } from '../materials/interfaces/MaterialPreset';
import { logMaterialStorageError } from '../materials/log.material.storage.error';
import { MATERIAL_PRESET_REPOSITORY } from '../materials/material.preset.repository';
import type { MaterialPresetsReadRace } from './interfaces/MaterialPresetsReadRace';
import { MachineProfileDeleted } from './machine.profile.state';
import {
  MaterialPresetDeleted,
  MaterialPresetSaved,
  MaterialPresetsLoaded,
  selectMaterialPresets,
} from './material.preset.state';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

function* showPresetStorageError(error: unknown): Generator {
  logMaterialStorageError(error);
  yield put(new ToastShown({
    severity: TOAST_SEVERITY.ERROR,
    messageKey: DEFAULT.TOAST_MATERIAL_PRESET_SAVE_FAILED,
    messageParameters: NO_TOAST_PARAMETERS,
  }));
}

function* storeSavedPreset(action: MaterialPresetSaved): Generator {
  try {
    yield call([MATERIAL_PRESET_REPOSITORY, MATERIAL_PRESET_REPOSITORY.putMaterialPreset], action.payload.preset);
  } catch (error: unknown) {
    yield call(showPresetStorageError, error);
  }
}

function* removeStoredPreset(presetId: string): Generator {
  try {
    yield call([MATERIAL_PRESET_REPOSITORY, MATERIAL_PRESET_REPOSITORY.deleteMaterialPreset], presetId);
  } catch (error: unknown) {
    yield call(showPresetStorageError, error);
  }
}

function* removePresetsOfDeletedProfile(action: MachineProfileDeleted): Generator {
  try {
    yield call(
      [MATERIAL_PRESET_REPOSITORY, MATERIAL_PRESET_REPOSITORY.deleteMaterialPresetsOfProfile],
      action.payload.profileId,
    );
  } catch (error: unknown) {
    yield call(showPresetStorageError, error);
  }
}

function* loadStoredPresets(deletedPresetIds: ReadonlySet<string>, deletedProfileIds: ReadonlySet<string>): Generator {
  try {
    const readRace: MaterialPresetsReadRace = (yield race({
      storedPresets: call([MATERIAL_PRESET_REPOSITORY, MATERIAL_PRESET_REPOSITORY.listMaterialPresets]),
      timeout: delay(PANEL_SIZES_READ_TIMEOUT_MS, true),
    })) as MaterialPresetsReadRace;

    if (readRace.storedPresets) {
      const savedPresets: MaterialPreset[] = (yield select(selectMaterialPresets)) as MaterialPreset[];

      yield put(new MaterialPresetsLoaded({
        presets: getStoredPresetsWithChanges(readRace.storedPresets, savedPresets, deletedPresetIds).filter(
          ({ machineProfileId }: MaterialPreset): boolean => !deletedProfileIds.has(machineProfileId),
        ),
      }));
    }
  } catch (error: unknown) {
    logMaterialStorageError(error);
  }
}

export function* watchMaterialPresets(): Generator {
  const deletedPresetIds: Set<string> = new Set<string>();
  const deletedProfileIds: Set<string> = new Set<string>();

  function* removeDeletedProfilePresets(action: MachineProfileDeleted): Generator {
    deletedProfileIds.add(action.payload.profileId);
    yield call(removePresetsOfDeletedProfile, action);
  }

  function* removeDeletedPreset(action: MaterialPresetDeleted): Generator {
    deletedPresetIds.add(action.payload.presetId);
    yield call(removeStoredPreset, action.payload.presetId);
  }

  // Listening starts before the read, so a change made during a slow or hanging read still reaches storage.
  yield takeEvery(MaterialPresetSaved.type, storeSavedPreset);
  yield takeEvery(MachineProfileDeleted.type, removeDeletedProfilePresets);
  yield takeEvery(MaterialPresetDeleted.type, removeDeletedPreset);
  yield call(loadStoredPresets, deletedPresetIds, deletedProfileIds);
}
