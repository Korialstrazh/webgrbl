/**
 * Gets the cells sharing a side with a grid cell.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnGridLayout } from './interfaces/BurnGridLayout';

export const getBurnGridNeighbourCells = (cell: number, { columnCount, rowCount }: BurnGridLayout): number[] => {
  const column: number = cell % columnCount;
  const row: number = Math.floor(cell / columnCount);
  const neighbourCells: number[] = [];

  if (column > 0) {
    neighbourCells.push(cell - 1);
  }

  if (column < columnCount - 1) {
    neighbourCells.push(cell + 1);
  }

  if (row > 0) {
    neighbourCells.push(cell - columnCount);
  }

  if (row < rowCount - 1) {
    neighbourCells.push(cell + columnCount);
  }

  return neighbourCells;
};
