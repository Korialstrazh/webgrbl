/**
 * The positions along one axis, from the start side, at every cell size step that is still inside the outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { FRAME_GRID_CELL_NONE_MM } from './frame.constants';

export const getFrameGridOffsets = (sizeMm: number, gridCellMm: number): number[] => {
  const offsets: number[] = [];

  if (gridCellMm <= FRAME_GRID_CELL_NONE_MM) {
    return offsets;
  }

  for (let offsetMm = gridCellMm; offsetMm < sizeMm; offsetMm += gridCellMm) {
    offsets.push(offsetMm);
  }

  return offsets;
};
