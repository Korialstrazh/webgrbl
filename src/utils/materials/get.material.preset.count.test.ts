import { describe, expect, it } from 'vitest';
import { getMaterialPresetCount } from './get.material.preset.count';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import { newMaterialPreset } from './new.material.preset';

const MATERIAL_ID = 'plywood';
const OTHER_MATERIAL_ID = 'acrylic';
const PROFILE_ID = 'ten-watt';
const OTHER_PROFILE_ID = 'five-watt';

const newPresetFixture = (materialId: string, machineProfileId: string): MaterialPreset => newMaterialPreset({
  materialId,
  machineProfileId,
  operation: MATERIAL_PRESET_OPERATION.CUT,
  powerWatts: 5,
  speedMmPerMin: 300,
  passes: 1,
  notes: '',
});

describe(getMaterialPresetCount.name, () => {
  it('counts the presets of the material on the profile only', () => {
    const presets: MaterialPreset[] = [
      newPresetFixture(MATERIAL_ID, PROFILE_ID),
      newPresetFixture(MATERIAL_ID, PROFILE_ID),
      newPresetFixture(MATERIAL_ID, OTHER_PROFILE_ID),
      newPresetFixture(OTHER_MATERIAL_ID, PROFILE_ID),
    ];

    expect(getMaterialPresetCount(presets, { materialId: MATERIAL_ID, machineProfileId: PROFILE_ID })).toBe(2);
  });

  it('gives 0 without a matching preset', () => {
    expect(getMaterialPresetCount([], { materialId: MATERIAL_ID, machineProfileId: PROFILE_ID })).toBe(0);
  });
});
