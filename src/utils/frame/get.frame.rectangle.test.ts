import { describe, expect, it } from 'vitest';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { getFrameRectangle } from './get.frame.rectangle';

const MARGIN_MM = 2;

describe(getFrameRectangle.name, () => {
  it('grows the burn outline by the margin on all four sides', () => {
    const moves = [
      newToolpathMove({ from: { x: 10, y: 20 }, to: { x: 50, y: 40 } }),
    ];

    expect(getFrameRectangle(moves, MARGIN_MM)).toEqual({
      minX: 8,
      minY: 18,
      maxX: 52,
      maxY: 42,
    });
  });

  it('counts burn moves with power 0, as overscan', () => {
    const moves = [
      newToolpathMove({ from: { x: 10, y: 10 }, to: { x: 20, y: 10 } }),
      newToolpathMove({
        from: { x: 20, y: 10 },
        to: { x: 30, y: 10 },
        powerPercent: 0,
      }),
    ];

    expect(getFrameRectangle(moves, 0)).toEqual({
      minX: 10,
      minY: 10,
      maxX: 30,
      maxY: 10,
    });
  });

  it('ignores travel moves', () => {
    const moves = [
      newToolpathMove({
        kind: TOOLPATH_MOVE_KIND.TRAVEL,
        from: { x: 0, y: 0 },
        to: { x: 5, y: 5 },
      }),
      newToolpathMove({ from: { x: 10, y: 10 }, to: { x: 20, y: 20 } }),
    ];

    expect(getFrameRectangle(moves, 0)).toEqual({
      minX: 10,
      minY: 10,
      maxX: 20,
      maxY: 20,
    });
  });

  it('returns undefined without burn moves', () => {
    const moves = [newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL })];

    expect(getFrameRectangle(moves, MARGIN_MM)).toBeUndefined();
    expect(getFrameRectangle([], MARGIN_MM)).toBeUndefined();
  });
});
