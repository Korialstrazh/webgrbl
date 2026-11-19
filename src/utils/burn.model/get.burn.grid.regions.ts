/**
 * Gets the connected areas of cells that are neither walls nor reached by the outside.
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
import type { BurnGridRegion } from './interfaces/BurnGridRegion';
import type { BurnGridRegionSet } from './interfaces/BurnGridRegionSet';
import { visitBurnGridConnectedCells } from './visit.burn.grid.connected.cells';

const addCellToRegion = (region: BurnGridRegion, cell: number, columnCount: number): void => {
  const column: number = cell % columnCount;
  const row: number = Math.floor(cell / columnCount);

  region.cellCount++;
  region.minColumn = Math.min(region.minColumn, column);
  region.maxColumn = Math.max(region.maxColumn, column);
  region.minRow = Math.min(region.minRow, row);
  region.maxRow = Math.max(region.maxRow, row);
};

export const getBurnGridRegions = (grid: BurnDoseGrid, outsideCells: Uint8Array): BurnGridRegionSet => {
  const regionNumbers: Int32Array = new Int32Array(outsideCells.length);
  const regions: BurnGridRegion[] = [];

  const isEnclosedCellOpen = (cell: number): boolean =>
    !grid.closedCutMask[cell] && !outsideCells[cell] && regionNumbers[cell] === BURN_REGION_LABEL_NONE;

  for (let firstCell = 0; firstCell < outsideCells.length; firstCell++) {
    if (isEnclosedCellOpen(firstCell)) {
      const region: BurnGridRegion = {
        regionNumber: regions.length + 1,
        firstCell,
        cellCount: 0,
        minColumn: grid.columnCount,
        maxColumn: 0,
        minRow: grid.rowCount,
        maxRow: 0,
      };

      visitBurnGridConnectedCells(grid, [firstCell], isEnclosedCellOpen, (cell: number): void => {
        regionNumbers[cell] = region.regionNumber;
        addCellToRegion(region, cell, grid.columnCount);
      });
      regions.push(region);
    }
  }

  return { regions, regionNumbers };
};
