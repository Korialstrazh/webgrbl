/**
 * How long the frame trace takes at its feed rate, in seconds; the ramps of the machine are not counted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SECONDS_PER_MINUTE } from '../toolpath/motion.constants';
import { FRAME_FEED_MM_PER_MIN } from './frame.constants';
import { getFrameGridOffsets } from './get.frame.grid.offsets';
import type { FrameRectangle } from './interfaces/FrameRectangle';

// A rectangle has two sides along each axis, so its outline is twice the width plus the height.
const RECTANGLE_SIDES_PER_AXIS = 2;

export const getFrameDurationSeconds = (rectangle: FrameRectangle, gridCellMm: number): number => {
  const widthMm: number = rectangle.maxX - rectangle.minX;
  const heightMm: number = rectangle.maxY - rectangle.minY;
  const outlineLengthMm: number = RECTANGLE_SIDES_PER_AXIS * (widthMm + heightMm);
  const gridLengthMm: number =
    getFrameGridOffsets(widthMm, gridCellMm).length * heightMm
    + getFrameGridOffsets(heightMm, gridCellMm).length * widthMm;

  return ((outlineLengthMm + gridLengthMm) / FRAME_FEED_MM_PER_MIN) * SECONDS_PER_MINUTE;
};
