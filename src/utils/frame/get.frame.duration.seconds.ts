/**
 * How long the frame trace takes at the given feed rate, in seconds; the ramps of the machine are not counted. GRBL
 * caps a move at the machine's $110 and $111, so this is a lower bound.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SECONDS_PER_MINUTE } from '../toolpath/motion.constants';
import { getFrameGridOffsets } from './get.frame.grid.offsets';
import type { FrameRectangle } from './interfaces/FrameRectangle';

// A rectangle has two sides along each axis, so its outline is twice the width plus the height.
const RECTANGLE_SIDES_PER_AXIS = 2;

export const getFrameDurationSeconds = (
  rectangle: FrameRectangle,
  gridCellMm: number,
  feedMmPerMin: number,
): number => {
  const widthMm: number = rectangle.maxX - rectangle.minX;
  const heightMm: number = rectangle.maxY - rectangle.minY;
  const outlineLengthMm: number = RECTANGLE_SIDES_PER_AXIS * (widthMm + heightMm);
  const gridLengthMm: number =
    getFrameGridOffsets(widthMm, gridCellMm).length * heightMm
    + getFrameGridOffsets(heightMm, gridCellMm).length * widthMm;

  return ((outlineLengthMm + gridLengthMm) / feedMmPerMin) * SECONDS_PER_MINUTE;
};
