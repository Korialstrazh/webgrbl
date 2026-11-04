import { describe, expect, it } from 'vitest';
import { DEFAULT } from '../localization/default.locales';
import { getMaterialPresetFieldErrors } from './get.material.preset.field.errors';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import type { MaterialPresetFieldErrors } from './interfaces/MaterialPresetFieldErrors';

type MaterialPresetNumbers = Pick<MaterialPreset, 'powerWatts' | 'speedMmPerMin' | 'passes'>;

const MAX_POWER_WATTS = 10;
const VALID_NUMBERS: MaterialPresetNumbers = { powerWatts: MAX_POWER_WATTS, speedMmPerMin: 300, passes: 1 };

describe(getMaterialPresetFieldErrors.name, () => {
  it('accepts full power of the laser', () => {
    expect(getMaterialPresetFieldErrors(VALID_NUMBERS, MAX_POWER_WATTS)).toEqual({
      powerErrorKey: undefined,
      speedErrorKey: undefined,
      passesErrorKey: undefined,
    });
  });

  it.each([0, Number.NaN, MAX_POWER_WATTS + 1])('rejects a power of %s', (powerWatts: number) => {
    expect(getMaterialPresetFieldErrors({ ...VALID_NUMBERS, powerWatts }, MAX_POWER_WATTS).powerErrorKey)
      .toBe(DEFAULT.MATERIAL_LIBRARY_POWER_INVALID);
  });

  it('rejects a speed of zero and part of a pass', () => {
    const errors: MaterialPresetFieldErrors =
      getMaterialPresetFieldErrors({ ...VALID_NUMBERS, speedMmPerMin: 0, passes: 1.5 }, MAX_POWER_WATTS);

    expect(errors.speedErrorKey).toBe(DEFAULT.MATERIAL_LIBRARY_SPEED_INVALID);
    expect(errors.passesErrorKey).toBe(DEFAULT.MATERIAL_LIBRARY_PASSES_INVALID);
  });
});
