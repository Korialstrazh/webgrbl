/**
 * Gets the regions on the sides of each wall cell that does not cut through. A cell touching fewer than two regions is
 * inside a thick wall or at a corner, so it takes the regions along its whole connected run of such cells.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BURN_REGION_LABEL_NONE } from './burn.model.constants';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnWallSides } from './interfaces/BurnWallSides';
import { visitBurnGridConnectedCells } from './visit.burn.grid.connected.cells';
import { visitBurnGridNeighbourCells } from './visit.burn.grid.neighbour.cells';

const MIN_DIRECT_SIDE_COUNT = 2;

const getDirectSides = (grid: BurnDoseGrid, regionNumbers: Int32Array, cell: number): Set<number> => {
  const directSides: Set<number> = new Set<number>();

  visitBurnGridNeighbourCells(cell, grid, (neighbourCell: number): void => {
    if (!grid.closedCutMask[neighbourCell]) {
      directSides.add(regionNumbers[neighbourCell] ?? BURN_REGION_LABEL_NONE);
    }
  });

  return directSides;
};

export const getBurnWallSides = (
  grid: BurnDoseGrid,
  regionNumbers: Int32Array,
  throughCells: Uint8Array,
): BurnWallSides => {
  const seenCells: Uint8Array = new Uint8Array(regionNumbers.length);
  const sidesByCell: Map<number, Set<number>> = new Map<number, Set<number>>();
  const cellsByRegion: Map<number, number[]> = new Map<number, number[]>();

  const isWeakWallCellOpen = (cell: number): boolean =>
    !!grid.closedCutMask[cell] && !throughCells[cell] && !seenCells[cell];

  for (let firstCell = 0; firstCell < regionNumbers.length; firstCell++) {
    if (isWeakWallCellOpen(firstCell)) {
      const runCells: number[] = [];
      const runSides: Set<number> = new Set<number>();

      visitBurnGridConnectedCells(grid, [firstCell], isWeakWallCellOpen, (cell: number): void => {
        seenCells[cell] = 1;
        runCells.push(cell);
      });

      for (const cell of runCells) {
        const directSides: Set<number> = getDirectSides(grid, regionNumbers, cell);

        directSides.forEach((side: number): void => {
          runSides.add(side);
          const regionCells: number[] = cellsByRegion.get(side) ?? [];

          regionCells.push(cell);
          cellsByRegion.set(side, regionCells);
        });
        sidesByCell.set(cell, directSides.size >= MIN_DIRECT_SIDE_COUNT ? directSides : runSides);
      }
    }
  }

  return { sidesByCell, cellsByRegion };
};
