import { describe, expect, it } from 'vitest';
import { getFrameDurationSeconds } from './get.frame.duration.seconds';
import type { FrameRectangle } from './interfaces/FrameRectangle';

const SQUARE_100_MM: FrameRectangle = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
// 400 mm at 1500 mm/min is 16 s.
const OUTLINE_ONLY_SECONDS = 16;
// Grid lines at 50 mm: one vertical and one horizontal of 100 mm, so 200 mm more, 8 s.
const WITH_GRID_SECONDS = 24;
const GRID_CELL_MM = 50;
const NO_GRID_MM = 0;

describe(getFrameDurationSeconds.name, () => {
  it('times the outline alone without a grid', () => {
    expect(getFrameDurationSeconds(SQUARE_100_MM, NO_GRID_MM)).toBeCloseTo(OUTLINE_ONLY_SECONDS);
  });

  it('adds the grid lines inside the outline', () => {
    expect(getFrameDurationSeconds(SQUARE_100_MM, GRID_CELL_MM)).toBeCloseTo(WITH_GRID_SECONDS);
  });
});
