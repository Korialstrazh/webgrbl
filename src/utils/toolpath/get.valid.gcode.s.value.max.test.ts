import { describe, expect, it } from 'vitest';
import { DEFAULT_MACHINE_S_VALUE_MAX } from '../profiles/machine.profile.constants';
import { getValidGcodeSValueMax } from './get.valid.gcode.s.value.max';

const LASER_S_VALUE_MAX = 255;

describe(getValidGcodeSValueMax.name, () => {
  it('keeps a finite S max of at least 1', () => {
    expect(getValidGcodeSValueMax(LASER_S_VALUE_MAX)).toBe(LASER_S_VALUE_MAX);
    expect(getValidGcodeSValueMax(1)).toBe(1);
  });

  it.each([0, 0.5, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'replaces %s with the default S max',
    (sValueMax: number) => {
      expect(getValidGcodeSValueMax(sValueMax)).toBe(DEFAULT_MACHINE_S_VALUE_MAX);
    },
  );
});
