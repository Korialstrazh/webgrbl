/**
 * Counts the stored presets of one material on one machine profile. A preset belongs to one laser, so the presets of
 * another profile are never counted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from './interfaces/MaterialPreset';

/** The material and the machine profile whose presets are counted. */
type MaterialPresetOwner = Pick<MaterialPreset, 'materialId' | 'machineProfileId'>;

export const getMaterialPresetCount = (presets: MaterialPreset[], owner: MaterialPresetOwner): number => {
  let presetCount: number = 0;

  for (const preset of presets) {
    if (preset.materialId === owner.materialId && preset.machineProfileId === owner.machineProfileId) {
      presetCount++;
    }
  }

  return presetCount;
};
