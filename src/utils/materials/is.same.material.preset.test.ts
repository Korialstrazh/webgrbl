import { describe, expect, it } from 'vitest';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { isSameMaterialPreset } from './is.same.material.preset';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import { newMaterialPreset } from './new.material.preset';

const PRESET: MaterialPreset = newMaterialPreset({
  materialId: 'plywood',
  machineProfileId: 'ten-watt',
  operation: MATERIAL_PRESET_OPERATION.CUT,
  powerWatts: 5,
  speedMmPerMin: 300,
  passes: 1,
  notes: 'slow',
});

describe(isSameMaterialPreset.name, () => {
  it('is true for a copy and false for any changed field', () => {
    expect(isSameMaterialPreset(PRESET, { ...PRESET })).toBe(true);
    expect(isSameMaterialPreset(PRESET, { ...PRESET, notes: 'fast' })).toBe(false);
    expect(isSameMaterialPreset(PRESET, { ...PRESET, powerWatts: 6 })).toBe(false);
    expect(isSameMaterialPreset(PRESET, { ...PRESET, operation: MATERIAL_PRESET_OPERATION.SHADE })).toBe(false);
  });

  it('treats an emptied number as the same emptied number', () => {
    const emptiedPreset: MaterialPreset = { ...PRESET, powerWatts: Number.NaN };

    expect(isSameMaterialPreset(emptiedPreset, { ...emptiedPreset })).toBe(true);
  });
});
