/**
 * Tests for the outside-the-bed check.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { describe, expect, it } from 'vitest';
import { BED_PLACEHOLDER_KIND } from '../bed/bed.constants';
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { isObjectOutsideBed } from './is.object.outside.bed';

const BED_SIZE_MM = 400;
const BOX_WIDTH_MM = 100;
const BOX_HEIGHT_MM = 20;
const EDGE_BOX_X_MM = 290;
const ROTATED_BOX_X_MM = 330;
const DIAGONAL_DEG = 45;
const QUARTER_TURN_DEG = 90;
const SMALL_NEGATIVE_X_MM = -0.1;

const bed: BedDimensions = {
  widthMm: BED_SIZE_MM,
  heightMm: BED_SIZE_MM,
  placeholderKind: BED_PLACEHOLDER_KIND.NONE,
};

const newTransform = (overrides: Partial<ProjectObjectTransform> = {}): ProjectObjectTransform => ({
  xMm: EDGE_BOX_X_MM,
  yMm: 0,
  widthMm: BOX_WIDTH_MM,
  heightMm: BOX_HEIGHT_MM,
  rotationDeg: 0,
  ...overrides,
});

describe(isObjectOutsideBed.name, () => {
  it('accepts a box that touches the bed edge', () => {
    expect(isObjectOutsideBed(newTransform(), bed)).toBe(false);
  });

  it('flags a box whose rotated corner leaves the bed', () => {
    expect(isObjectOutsideBed(newTransform({ xMm: ROTATED_BOX_X_MM, rotationDeg: DIAGONAL_DEG }), bed)).toBe(true);
  });

  it('flags a box left of the bed edge', () => {
    expect(isObjectOutsideBed(newTransform({ xMm: SMALL_NEGATIVE_X_MM }), bed)).toBe(true);
  });

  it('does not flag a square in the bed turned by 90 degrees', () => {
    const squareTransform: ProjectObjectTransform = newTransform({
      xMm: 0,
      widthMm: BOX_WIDTH_MM,
      heightMm: BOX_WIDTH_MM,
      rotationDeg: QUARTER_TURN_DEG,
    });

    expect(isObjectOutsideBed(squareTransform, bed)).toBe(false);
  });
});
