/**
 * Gets the region around each region, peeling from outside. Connected wall cells count as one wall, and every region
 * still unseen along a wall gets as parent the region the wall was first reached from. Crossing outlines share one
 * wall, so the regions they make are siblings. Parents are region numbers, BURN_REGION_LABEL_NONE being the outside.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_REGION_LABEL_NONE } from './burn.model.constants';
import { getBurnGridNeighbourCells } from './get.burn.grid.neighbour.cells';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnRegionNesting } from './interfaces/BurnRegionNesting';
import { visitBurnGridConnectedCells } from './visit.burn.grid.connected.cells';

/** For each group of connected wall cells, the numbers of the regions along it. */
const getRegionNumbersAlongWalls = (
  grid: BurnDoseGrid,
  regionNumbers: Int32Array,
  wallNumbers: Int32Array,
): Set<number>[] => {
  const regionNumbersAlongWalls: Set<number>[] = [];

  const isWallCellOpen = (cell: number): boolean => !!grid.closedCutMask[cell] && !wallNumbers[cell];

  for (let firstCell = 0; firstCell < regionNumbers.length; firstCell++) {
    if (isWallCellOpen(firstCell)) {
      const regionNumbersAlongWall: Set<number> = new Set<number>();
      const wallNumber: number = regionNumbersAlongWalls.length + 1;

      visitBurnGridConnectedCells(grid, [firstCell], isWallCellOpen, (cell: number): void => {
        wallNumbers[cell] = wallNumber;

        for (const neighbourCell of getBurnGridNeighbourCells(cell, grid)) {
          if (!grid.closedCutMask[neighbourCell]) {
            regionNumbersAlongWall.add(regionNumbers[neighbourCell] ?? BURN_REGION_LABEL_NONE);
          }
        }
      });
      regionNumbersAlongWalls.push(regionNumbersAlongWall);
    }
  }

  return regionNumbersAlongWalls;
};

export const getBurnRegionNesting = (grid: BurnDoseGrid, regionNumbers: Int32Array): BurnRegionNesting => {
  const wallNumbers: Int32Array = new Int32Array(regionNumbers.length);
  const regionNumbersAlongWalls: Set<number>[] = getRegionNumbersAlongWalls(grid, regionNumbers, wallNumbers);
  const parents: Map<number, number> = new Map<number, number>();
  const outerWallNumbers: Map<number, number> = new Map<number, number>();
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
            outerWallNumbers.set(regionNumber, wallIndex + 1);
            peelOrder.push(regionNumber);
          }
        }
      }
    }
  }

  return { parents, outerWallNumbers, wallNumbers };
};
