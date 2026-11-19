/**
 * Visits every cell connected to the seed cells by sides. isCellOpen must turn false for a cell once it has been
 * visited; the caller marks visited cells in its own array, so that many floods can share one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnGridLayout } from './interfaces/BurnGridLayout';
import { visitBurnGridNeighbourCells } from './visit.burn.grid.neighbour.cells';

export const visitBurnGridConnectedCells = (
  layout: BurnGridLayout,
  seedCells: number[],
  isCellOpen: (cell: number) => boolean,
  visitCell: (cell: number) => void,
): void => {
  const pendingCells: number[] = [];

  const enterCellWhenOpen = (cell: number): void => {
    if (isCellOpen(cell)) {
      visitCell(cell);
      pendingCells.push(cell);
    }
  };

  seedCells.forEach(enterCellWhenOpen);

  // for-of also walks the cells added while it runs.
  for (const cell of pendingCells) {
    visitBurnGridNeighbourCells(cell, layout, enterCellWhenOpen);
  }
};
