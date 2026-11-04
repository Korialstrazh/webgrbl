import { describe, expect, it } from 'vitest';
import { getMatchingMaterialPreset } from './get.matching.material.preset';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import { newMaterialPreset } from './new.material.preset';

const MATERIAL_ID = 'plywood';
const PROFILE_ID = 'ten-watt';

type MaterialPresetOverrides = Partial<MaterialPreset>;

const newPresetFixture = (overrides: MaterialPresetOverrides = {}): MaterialPreset => ({
  ...newMaterialPreset({
    materialId: MATERIAL_ID,
    machineProfileId: PROFILE_ID,
    operation: MATERIAL_PRESET_OPERATION.CUT,
    powerWatts: 5,
    speedMmPerMin: 300,
    passes: 1,
    notes: '',
  }),
  ...overrides,
});

describe(getMatchingMaterialPreset.name, () => {
  it('finds the preset of the same material, machine and operation, whatever its numbers', () => {
    const match: MaterialPreset = newPresetFixture({ powerWatts: 9, passes: 3 });

    const engravePreset: MaterialPreset = newPresetFixture({ operation: MATERIAL_PRESET_OPERATION.ENGRAVE });

    expect(getMatchingMaterialPreset([engravePreset, match], match)).toBe(match);
  });

  it('gives undefined when the material, the machine or the operation differs', () => {
    const stored: MaterialPreset = newPresetFixture();
    const presets: MaterialPreset[] = [stored];

    expect(getMatchingMaterialPreset(presets, { ...stored, materialId: 'acrylic' })).toBeUndefined();
    expect(getMatchingMaterialPreset(presets, { ...stored, machineProfileId: 'other' })).toBeUndefined();
    expect(getMatchingMaterialPreset(presets, { ...stored, operation: MATERIAL_PRESET_OPERATION.SHADE }))
      .toBeUndefined();
  });
});
