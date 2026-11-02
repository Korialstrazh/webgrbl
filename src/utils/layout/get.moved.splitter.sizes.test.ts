import { describe, expect, it } from 'vitest';
import { getMovedSplitterSizes } from './get.moved.splitter.sizes';
import { getSplitterBarRange } from './get.splitter.bar.range';
import type { PanelSizeLimitsPercent } from './interfaces/PanelSizeLimitsPercent';

const SIZES: readonly number[] = [20, 55, 25];
const LIMITS: readonly PanelSizeLimitsPercent[] = [
  { minPercent: 15, maxPercent: 30 },
  { minPercent: 40, maxPercent: 100 },
  { minPercent: 20, maxPercent: 30 },
];

describe(getSplitterBarRange.name, () => {
  it('places the second bar after the first two panels, limited by both panels beside it', () => {
    expect(getSplitterBarRange(SIZES, LIMITS, 1)).toEqual({ positionPercent: 75, minPercent: 70, maxPercent: 80 });
  });

  it('keeps the current position inside the range when the sizes already break a limit', () => {
    expect(getSplitterBarRange([10, 65, 25], LIMITS, 0).minPercent).toBe(10);
  });
});

describe(getMovedSplitterSizes.name, () => {
  it('moves only the two panels beside the bar and keeps the total', () => {
    expect(getMovedSplitterSizes({ sizePercents: SIZES, limits: LIMITS, barIndex: 0, targetPercent: 25 }))
      .toEqual([25, 50, 25]);
  });

  it('stops the bar at the limit of a panel', () => {
    expect(getMovedSplitterSizes({ sizePercents: SIZES, limits: LIMITS, barIndex: 0, targetPercent: 50 }))
      .toEqual([30, 45, 25]);
  });
});
