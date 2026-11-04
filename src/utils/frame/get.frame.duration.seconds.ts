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

export const getFrameDurationSeconds = (rectangle: FrameRectangle, gridCellMm: number): number => {
  const widthMm: number = rectangle.maxX - rectangle.minX;
  const heightMm: number = rectangle.maxY - rectangle.minY;
  const outlineLengthMm: number = 2 * (widthMm + heightMm);
  const gridLengthMm: number =
    getFrameGridOffsets(widthMm, gridCellMm).length * heightMm
    + getFrameGridOffsets(heightMm, gridCellMm).length * widthMm;

  return ((outlineLengthMm + gridLengthMm) / FRAME_FEED_MM_PER_MIN) * SECONDS_PER_MINUTE;
};
