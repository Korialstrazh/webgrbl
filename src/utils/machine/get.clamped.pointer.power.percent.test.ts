import { describe, expect, it } from 'vitest';
import { getClampedPointerPowerPercent } from './get.clamped.pointer.power.percent';
import { MAX_POINTER_POWER_PERCENT, MIN_POINTER_POWER_PERCENT } from './machine.command.constants';

const IN_RANGE_PERCENT = 2;
const BELOW_MINIMUM_PERCENT = 0;
const ABOVE_CAP_PERCENT = 100;

describe(getClampedPointerPowerPercent.name, () => {
  it('keeps a percent inside the range', () => {
    expect(getClampedPointerPowerPercent(IN_RANGE_PERCENT)).toBe(IN_RANGE_PERCENT);
  });

  it('raises a percent below the minimum to the minimum', () => {
    expect(getClampedPointerPowerPercent(BELOW_MINIMUM_PERCENT)).toBe(MIN_POINTER_POWER_PERCENT);
  });

  it('lowers a percent above the cap to the cap', () => {
    expect(getClampedPointerPowerPercent(ABOVE_CAP_PERCENT)).toBe(MAX_POINTER_POWER_PERCENT);
  });
});
