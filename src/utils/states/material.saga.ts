/**
 * Keeps the materials in step with storage: reads them at start and stores every save at once. A read that fails or
 * neither finishes nor fails within the panel sizes read timeout keeps the materials in the state. A failed store logs
 * the error and shows a fixed toast.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, delay, put, race, select, takeEvery } from 'redux-saga/effects';
import { PANEL_SIZES_READ_TIMEOUT_MS } from '../layout.constants';
import { DEFAULT } from '../localization/default.locales';
import type { Material } from '../materials/interfaces/Material';
import { logMaterialStorageError } from '../materials/log.material.storage.error';
import { MATERIAL_REPOSITORY } from '../materials/material.repository';
import type { MaterialsReadRace } from './interfaces/MaterialsReadRace';
import { MaterialSaved, MaterialTestResultSaved, MaterialsLoaded, selectMaterials } from './material.state';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

/** The stored materials, with the materials saved while they were being read taking the place of their older copies. */
const getStoredMaterialsWithSavedMaterials = (storedMaterials: Material[], savedMaterials: Material[]): Material[] => {
  const savedMaterialsById: Map<string, Material> = new Map<string, Material>();

  for (const savedMaterial of savedMaterials) {
    savedMaterialsById.set(savedMaterial.id, savedMaterial);
  }

  const storedMaterialIds: Set<string> =
    new Set<string>(storedMaterials.map((material: Material): string => material.id));

  return [
    ...storedMaterials.map((material: Material): Material => savedMaterialsById.get(material.id) ?? material),
    ...savedMaterials.filter((material: Material): boolean => !storedMaterialIds.has(material.id)),
  ];
};

function* loadStoredMaterials(): Generator {
  try {
    const readRace: MaterialsReadRace = (yield race({
      storedMaterials: call([MATERIAL_REPOSITORY, MATERIAL_REPOSITORY.listMaterials]),
      timeout: delay(PANEL_SIZES_READ_TIMEOUT_MS, true),
    })) as MaterialsReadRace;

    if (readRace.storedMaterials) {
      const savedMaterials: Material[] = (yield select(selectMaterials)) as Material[];

      yield put(new MaterialsLoaded({
        materials: getStoredMaterialsWithSavedMaterials(readRace.storedMaterials, savedMaterials),
      }));
    }
  } catch (error: unknown) {
    logMaterialStorageError(error);
  }
}

function* storeMaterial(material: Material): Generator {
  try {
    yield call([MATERIAL_REPOSITORY, MATERIAL_REPOSITORY.putMaterial], material);
  } catch (error: unknown) {
    logMaterialStorageError(error);
    yield put(new ToastShown({
      severity: TOAST_SEVERITY.ERROR,
      messageKey: DEFAULT.TOAST_MATERIAL_SAVE_FAILED,
      messageParameters: NO_TOAST_PARAMETERS,
    }));
  }
}

function* storeSavedMaterial(action: MaterialSaved): Generator {
  yield call(storeMaterial, action.payload.material);
}

/** The reducer has already added the result, so the state holds the material as it must be stored. */
function* storeMaterialWithSavedTestResult(action: MaterialTestResultSaved): Generator {
  const materials: Material[] = (yield select(selectMaterials)) as Material[];
  const testedMaterial: Material | undefined =
    materials.find((material: Material): boolean => material.id === action.payload.materialId);

  if (testedMaterial) {
    yield call(storeMaterial, testedMaterial);
  }
}

export function* watchMaterials(): Generator {
  // Listening starts before the read, so a save made during a slow or hanging read still reaches storage.
  yield takeEvery(MaterialSaved.type, storeSavedMaterial);
  yield takeEvery(MaterialTestResultSaved.type, storeMaterialWithSavedTestResult);
  yield call(loadStoredMaterials);
}
