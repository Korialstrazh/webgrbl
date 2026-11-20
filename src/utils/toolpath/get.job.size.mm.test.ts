import { describe, expect, it } from 'vitest';
import { getJobSizeMm } from './get.job.size.mm';

describe(getJobSizeMm.name, () => {
  it('returns undefined without bounds', () => {
    expect(getJobSizeMm(undefined)).toBeUndefined();
  });

  it('returns the width and height of the bounds', () => {
    expect(getJobSizeMm({ minX: 10, minY: 5, maxX: 430, maxY: 599 })).toEqual({ widthMm: 420, heightMm: 594 });
  });
});
