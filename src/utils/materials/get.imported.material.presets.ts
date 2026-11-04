/**
 * Reads a material presets file for the importing machine, or undefined when any of it is not valid, so that a bad
 * file changes nothing. Power keeps its share of the source laser: a percentage is what carries over between lasers,
 * and a file can come from anywhere, so every number is brought into range. Materials are matched by name and
 * thickness.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getNumberInRange } from '../get.number.in.range';
import { getRoundedNumber } from '../get.rounded.number';
import {
  PASSES_MAX,
  PASSES_MIN,
  SPEED_MM_PER_MIN_MAX,
  SPEED_MM_PER_MIN_MIN,
} from '../palette/palette.constants';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import { getMatchingMaterial } from './get.matching.material';
import type { ImportedMaterialPresets } from './interfaces/ImportedMaterialPresets';
import type { Material } from './interfaces/Material';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import type { MaterialPresetsFilePreset } from './interfaces/MaterialPresetsFile';
import {
  MATERIAL_NAME_LENGTH_MAX,
  MATERIAL_THICKNESS_MM_MAX,
  MATERIAL_THICKNESS_MM_MIN,
} from './material.constants';
import {
  MATERIAL_PRESET_NOTES_LENGTH_MAX,
  MATERIAL_PRESET_OPERATION,
  MATERIAL_PRESETS_FILE_FORMAT,
  MATERIAL_PRESETS_FILE_VERSION,
} from './material.preset.constants';
import { newMaterial } from './new.material';
import { newMaterialPreset } from './new.material.preset';

type ImportingMachineProfile = Pick<MachineProfile, 'id' | 'maxPowerWatts'>;

const IMPORTED_POWER_WATTS_DECIMALS = 2;
const IMPORTED_POWER_WATTS_MIN = 0.01;
const MATERIAL_PRESET_OPERATIONS: readonly unknown[] = Object.values(MATERIAL_PRESET_OPERATION);

const isFilePreset = (value: unknown): value is MaterialPresetsFilePreset =>
  isRecord(value) &&
  isString(value.materialName) &&
  Boolean(value.materialName.trim()) &&
  isFiniteNumber(value.thicknessMm) &&
  isFiniteNumber(value.sourceMaxPowerWatts) &&
  value.sourceMaxPowerWatts > 0 &&
  MATERIAL_PRESET_OPERATIONS.includes(value.operation) &&
  isFiniteNumber(value.powerWatts) &&
  value.powerWatts > 0 &&
  isFiniteNumber(value.speedMmPerMin) &&
  isFiniteNumber(value.passes) &&
  isString(value.notes);

const getFilePresets = (fileText: string): MaterialPresetsFilePreset[] | undefined => {
  try {
    const parsedFile: unknown = JSON.parse(fileText);

    if (
      isRecord(parsedFile) &&
      parsedFile.format === MATERIAL_PRESETS_FILE_FORMAT &&
      parsedFile.version === MATERIAL_PRESETS_FILE_VERSION &&
      Array.isArray(parsedFile.presets) &&
      parsedFile.presets.length &&
      parsedFile.presets.every(isFilePreset)
    ) {
      return parsedFile.presets;
    }

    return undefined;
  } catch {
    return undefined;
  }
};

const getRescaledPowerWatts = (filePreset: MaterialPresetsFilePreset, maxPowerWatts: number): number => {
  const rescaledWatts: number = (filePreset.powerWatts * maxPowerWatts) / filePreset.sourceMaxPowerWatts;

  return getRoundedNumber(
    getNumberInRange(rescaledWatts, IMPORTED_POWER_WATTS_MIN, maxPowerWatts),
    IMPORTED_POWER_WATTS_DECIMALS,
  );
};

export const getImportedMaterialPresets = (
  fileText: string,
  materials: Material[],
  { id: machineProfileId, maxPowerWatts }: ImportingMachineProfile,
): ImportedMaterialPresets | undefined => {
  const filePresets: MaterialPresetsFilePreset[] | undefined = getFilePresets(fileText);

  if (!filePresets) {
    return undefined;
  }

  const newMaterials: Material[] = [];
  const presets: MaterialPreset[] = [];

  for (const filePreset of filePresets) {
    const materialFields: Pick<Material, 'name' | 'thicknessMm'> = {
      name: filePreset.materialName.trim().slice(0, MATERIAL_NAME_LENGTH_MAX),
      thicknessMm: getNumberInRange(filePreset.thicknessMm, MATERIAL_THICKNESS_MM_MIN, MATERIAL_THICKNESS_MM_MAX),
    };
    let material: Material | undefined = getMatchingMaterial([...materials, ...newMaterials], materialFields);

    if (!material) {
      material = newMaterial(materialFields);
      newMaterials.push(material);
    }

    presets.push(newMaterialPreset({
      materialId: material.id,
      machineProfileId,
      operation: filePreset.operation,
      powerWatts: getRescaledPowerWatts(filePreset, maxPowerWatts),
      speedMmPerMin: getNumberInRange(filePreset.speedMmPerMin, SPEED_MM_PER_MIN_MIN, SPEED_MM_PER_MIN_MAX),
      passes: Math.round(getNumberInRange(filePreset.passes, PASSES_MIN, PASSES_MAX)),
      notes: filePreset.notes.slice(0, MATERIAL_PRESET_NOTES_LENGTH_MAX),
    }));
  }

  return { newMaterials, presets };
};
