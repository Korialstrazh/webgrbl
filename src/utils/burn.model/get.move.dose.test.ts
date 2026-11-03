import { describe, expect, it } from 'vitest';
import { getMoveDose } from './get.move.dose';

const POWER_PERCENT = 100;
const FEED_MM_PER_MIN = 200;
const HALF_DOSE = 0.5;

describe(getMoveDose.name, () => {
  it('divides power by feed', () => {
    expect(getMoveDose(POWER_PERCENT, FEED_MM_PER_MIN)).toBe(HALF_DOSE);
  });

  it('is zero when the feed is zero', () => {
    expect(getMoveDose(POWER_PERCENT, 0)).toBe(0);
  });
});
