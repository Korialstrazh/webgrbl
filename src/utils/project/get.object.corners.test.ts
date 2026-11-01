/**
 * Tests for the rotated corners of an object's box.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { describe, expect, it } from 'vitest';
import { getObjectCorners } from './get.object.corners';
import type { ObjectCornerPoint } from './interfaces/ObjectCornerPoint';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';

const BOX_SIZE_MM = 10;
const QUARTER_TURN_DEG = 90;
const FLOAT_PRECISION_DIGITS = 9;

const squareTransform: ProjectObjectTransform = {
  xMm: 0,
  yMm: 0,
  widthMm: BOX_SIZE_MM,
  heightMm: BOX_SIZE_MM,
  rotationDeg: 0,
};

const getRoundedText = (value: number): string => (Number(value.toFixed(FLOAT_PRECISION_DIGITS)) + 0).toString();

const getCornerKey = (corner: ObjectCornerPoint): string => `${getRoundedText(corner.x)},${getRoundedText(corner.y)}`;

const getSortedKeys = (corners: ObjectCornerPoint[]): string[] => corners.map(getCornerKey).sort();

describe(getObjectCorners.name, () => {
  it('returns the box corners when not rotated', () => {
    expect(getObjectCorners(squareTransform)).toEqual([
      { x: 0, y: 0 },
      { x: BOX_SIZE_MM, y: 0 },
      { x: BOX_SIZE_MM, y: BOX_SIZE_MM },
      { x: 0, y: BOX_SIZE_MM },
    ]);
  });

  it('returns the same corners for a square turned by 90 degrees', () => {
    const rotatedCorners: ObjectCornerPoint[] = getObjectCorners({ ...squareTransform, rotationDeg: QUARTER_TURN_DEG });

    expect(getSortedKeys(rotatedCorners)).toEqual(getSortedKeys(getObjectCorners(squareTransform)));
  });

  it('turns counter-clockwise in the Y-up frame', () => {
    const rotatedCorners: ObjectCornerPoint[] = getObjectCorners({
      ...squareTransform,
      rotationDeg: QUARTER_TURN_DEG,
    });

    expect(rotatedCorners[0]?.x).toBeCloseTo(BOX_SIZE_MM);
    expect(rotatedCorners[0]?.y).toBeCloseTo(0);
  });
});
