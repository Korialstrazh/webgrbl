import { describe, expect, it } from 'vitest';
import { getClampedPointerPowerPercent } from './get.clamped.pointer.power.percent';
import { MAX_POINTER_POWER_PERCENT, MIN_POINTER_POWER_PERCENT } from './machine.command.constants';

const IN_RANGE_PERCENT = 2;

describe(getClampedPointerPowerPercent.name, () => {
  it('keeps a percent inside the range', () => {
    expect(getClampedPointerPowerPercent(IN_RANGE_PERCENT)).toBe(IN_RANGE_PERCENT);
  });

  it('raises a percent below the minimum to the minimum', () => {
    expect(getClampedPointerPowerPercent(0)).toBe(MIN_POINTER_POWER_PERCENT);
  });

  it('lowers a percent above the cap to the cap', () => {
    expect(getClampedPointerPowerPercent(100)).toBe(MAX_POINTER_POWER_PERCENT);
  });
});
