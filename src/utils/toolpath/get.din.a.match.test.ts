import { describe, expect, it } from 'vitest';
import type { DinAMatch } from './interfaces/DinAMatch';
import { getDinAMatch } from './get.din.a.match';

const A2_PORTRAIT_NEAR: DinAMatch = {
  name: 'A2',
  widthMm: 420,
  heightMm: 594,
  widthDeltaMm: -1,
  heightDeltaMm: 0,
  isExact: false,
};

describe(getDinAMatch.name, () => {
  it('matches a job one millimetre narrower than A2 portrait', () => {
    expect(getDinAMatch(419, 594)).toEqual(A2_PORTRAIT_NEAR);
  });

  it('matches A2 landscape exactly', () => {
    expect(getDinAMatch(594, 420)).toEqual({
      name: 'A2',
      widthMm: 594,
      heightMm: 420,
      widthDeltaMm: 0,
      heightDeltaMm: 0,
      isExact: true,
    });
  });

  it('matches A4 landscape exactly', () => {
    expect(getDinAMatch(297, 210)).toMatchObject({ name: 'A4', isExact: true });
  });

  it('accepts a delta exactly on the tolerance boundary', () => {
    expect(getDinAMatch(417, 594)).toMatchObject({ name: 'A2', widthDeltaMm: -3 });
  });

  it('rejects a delta just outside the tolerance', () => {
    expect(getDinAMatch(416.9, 594)).toBeUndefined();
  });

  it('rejects a size that is no DIN A size', () => {
    expect(getDinAMatch(100, 100)).toBeUndefined();
  });

  it('treats a delta below 0.1 mm as exact', () => {
    expect(getDinAMatch(210.04, 297)).toMatchObject({ name: 'A4', isExact: true });
  });
});
