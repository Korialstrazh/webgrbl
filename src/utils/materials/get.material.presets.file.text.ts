/**
 * Gets the text of a material presets file. A preset whose material or machine is not known has nothing to tell the
 * receiver, so it is left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { Material } from './interfaces/Material';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import type { MaterialPresetsFile } from './interfaces/MaterialPresetsFile';
import type { MaterialPresetsFilePreset } from './interfaces/MaterialPresetsFilePreset';
import {
  MATERIAL_PRESETS_FILE_FORMAT,
  MATERIAL_PRESETS_FILE_INDENT,
  MATERIAL_PRESETS_FILE_VERSION,
} from './material.preset.constants';

export const getMaterialPresetsFileText = (
  presets: MaterialPreset[],
  materials: Material[],
  profiles: MachineProfile[],
): string => {
  const filePresets: MaterialPresetsFilePreset[] = [];

  for (const { materialId, machineProfileId, operation, powerWatts, speedMmPerMin, passes, notes } of presets) {
    const material: Material | undefined = materials.find(({ id }: Material): boolean => id === materialId);
    const profile: MachineProfile | undefined =
      profiles.find(({ id }: MachineProfile): boolean => id === machineProfileId);

    if (material && profile) {
      filePresets.push({
        materialName: material.name,
        thicknessMm: material.thicknessMm,
        sourceMaxPowerWatts: profile.maxPowerWatts,
        operation,
        powerWatts,
        speedMmPerMin,
        passes,
        notes,
      });
    }
  }

  const presetsFile: MaterialPresetsFile = {
    format: MATERIAL_PRESETS_FILE_FORMAT,
    version: MATERIAL_PRESETS_FILE_VERSION,
    presets: filePresets,
  };

  return JSON.stringify(presetsFile, undefined, MATERIAL_PRESETS_FILE_INDENT);
};
