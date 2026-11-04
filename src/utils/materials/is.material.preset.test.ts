import { describe, expect, it } from 'vitest';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { isMaterialPreset } from './is.material.preset';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import { newMaterialPreset } from './new.material.preset';

const VALID_PRESET: MaterialPreset = newMaterialPreset({
  materialId: 'material-a',
  machineProfileId: 'profile-a',
  operation: MATERIAL_PRESET_OPERATION.CUT,
  powerWatts: 10,
  speedMmPerMin: 300,
  passes: 2,
  notes: '',
});

describe(isMaterialPreset.name, () => {
  it('accepts a new preset', () => {
    expect(isMaterialPreset(VALID_PRESET)).toBe(true);
  });

  it('rejects an unknown operation', () => {
    expect(isMaterialPreset({ ...VALID_PRESET, operation: 'melt' })).toBe(false);
  });

  it('rejects power that is not a finite number', () => {
    expect(isMaterialPreset({ ...VALID_PRESET, powerWatts: Number.NaN })).toBe(false);
  });
});
