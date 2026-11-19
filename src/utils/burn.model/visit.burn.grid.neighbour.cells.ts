/**
 * Visits the cells sharing a side with a grid cell. It takes a callback instead of returning a list because a flood
 * asks this for every cell of the sheet, up to a million times per flood.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnGridLayout } from './interfaces/BurnGridLayout';

export const visitBurnGridNeighbourCells = (
  cell: number,
  { columnCount, rowCount }: BurnGridLayout,
  visitNeighbourCell: (neighbourCell: number) => void,
): void => {
  const column: number = cell % columnCount;

  if (column > 0) {
    visitNeighbourCell(cell - 1);
  }

  if (column < columnCount - 1) {
    visitNeighbourCell(cell + 1);
  }

  if (cell >= columnCount) {
    visitNeighbourCell(cell - columnCount);
  }

  if (cell < (rowCount - 1) * columnCount) {
    visitNeighbourCell(cell + columnCount);
  }
};
