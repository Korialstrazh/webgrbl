/**
 * The positions along one axis, from the start side, at every cell size step that is still inside the outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
