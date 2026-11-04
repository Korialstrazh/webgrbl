import { describe, expect, it } from 'vitest';
import { getPresetPowerPercent } from './get.preset.power.percent';

const MAX_POWER_WATTS = 10;

describe(getPresetPowerPercent.name, () => {
  it('gives the share of the rated power as percent', () => {
    expect(getPresetPowerPercent({ powerWatts: 8 }, MAX_POWER_WATTS)).toBe(80);
  });

  it('rounds to one decimal', () => {
    expect(getPresetPowerPercent({ powerWatts: 1 }, 3)).toBe(33.3);
  });
});
