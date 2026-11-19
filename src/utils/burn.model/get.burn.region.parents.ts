/**
 * Gets the region around each region, peeling from outside. Connected wall cells count as one wall, and every region
 * still unseen along a wall gets as parent the region the wall was first reached from. Crossing outlines share one
 * wall, so the regions they make are siblings. Parents are region numbers, BURN_REGION_LABEL_NONE being the outside.
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
import { visitBurnGridConnectedCells } from './visit.burn.grid.connected.cells';
import { visitBurnGridNeighbourCells } from './visit.burn.grid.neighbour.cells';

/** For each group of connected wall cells, the numbers of the regions along it. */
const getRegionNumbersAlongWalls = (grid: BurnDoseGrid, regionNumbers: Int32Array): Set<number>[] => {
  const seenWallCells: Uint8Array = new Uint8Array(regionNumbers.length);
  const regionNumbersAlongWalls: Set<number>[] = [];

  const isWallCellOpen = (cell: number): boolean => !!grid.closedCutMask[cell] && !seenWallCells[cell];

  for (let firstCell = 0; firstCell < regionNumbers.length; firstCell++) {
    if (isWallCellOpen(firstCell)) {
      const regionNumbersAlongWall: Set<number> = new Set<number>();

      visitBurnGridConnectedCells(grid, [firstCell], isWallCellOpen, (cell: number): void => {
        seenWallCells[cell] = 1;

        visitBurnGridNeighbourCells(cell, grid, (neighbourCell: number): void => {
          if (!grid.closedCutMask[neighbourCell]) {
            regionNumbersAlongWall.add(regionNumbers[neighbourCell] ?? BURN_REGION_LABEL_NONE);
          }
        });
      });
      regionNumbersAlongWalls.push(regionNumbersAlongWall);
    }
  }

  return regionNumbersAlongWalls;
};

export const getBurnRegionParents = (grid: BurnDoseGrid, regionNumbers: Int32Array): Map<number, number> => {
  const regionNumbersAlongWalls: Set<number>[] = getRegionNumbersAlongWalls(grid, regionNumbers);
  const parents: Map<number, number> = new Map<number, number>();
  const peelOrder: number[] = [BURN_REGION_LABEL_NONE];
  const seenRegionNumbers: Set<number> = new Set<number>(peelOrder);
  const peeledWallIndexes: Set<number> = new Set<number>();

  for (const peeledRegionNumber of peelOrder) {
    for (const [wallIndex, regionNumbersAlongWall] of regionNumbersAlongWalls.entries()) {
      if (regionNumbersAlongWall.has(peeledRegionNumber) && !peeledWallIndexes.has(wallIndex)) {
        peeledWallIndexes.add(wallIndex);

        for (const regionNumber of regionNumbersAlongWall) {
          if (!seenRegionNumbers.has(regionNumber)) {
            seenRegionNumbers.add(regionNumber);
            parents.set(regionNumber, peeledRegionNumber);
            peelOrder.push(regionNumber);
          }
        }
      }
    }
  }

  return parents;
};
