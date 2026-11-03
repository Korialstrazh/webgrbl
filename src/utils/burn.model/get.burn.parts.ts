/**
 * Finds the parts a job cuts free. Closed cuts make the candidate regions; flooding from outside, first through every
 * wall that does not cut through and then through every wall that does not at least nearly cut through, shows which
 * candidates are free, borderline or still attached.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BURN_DOSE_STORAGE_TOLERANCE_RATIO,
  BURN_PART_STATUS,
  BURN_REGION_LABEL_NONE,
  CUT_DEPTH_LEVEL,
  CUT_PART_MIN_AREA_MM2,
} from './burn.model.constants';
import type { BurnPartStatus, CutDepthLevel } from './burn.model.constants';
import { getBurnAttachmentLargestRegions } from './get.burn.attachment.largest.regions';
import { getBurnDepthPrediction } from './get.burn.depth.prediction';
import { getBurnGridNeighbourCells } from './get.burn.grid.neighbour.cells';
import { getBurnGridOutsideCells } from './get.burn.grid.outside.cells';
import { getBurnGridRegions } from './get.burn.grid.regions';
import { getBurnRegionParents } from './get.burn.region.parents';
import type { BurnDepthPrediction } from './interfaces/BurnDepthPrediction';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnGridRegion } from './interfaces/BurnGridRegion';
import type { BurnGridRegionSet } from './interfaces/BurnGridRegionSet';
import type { BurnPart } from './interfaces/BurnPart';
import type { BurnPartSet } from './interfaces/BurnPartSet';
import type { BurnPartsInput } from './interfaces/BurnPartsInput';
import type { BurnWallLevelCells } from './interfaces/BurnWallLevelCells';
import type { BurnWeakestWall } from './interfaces/BurnWeakestWall';
import type { ToolpathBounds } from '../toolpath/interfaces/ToolpathBounds';

/** A region's outermost cells touch its walls, so half a cell past them, on each side, is the middle of the wall. */
const WALL_MIDDLE_CELL_OFFSET = 0.5;

/** Total dose of a cell, raised by what storing it as a 32-bit float can have rounded away. */
const getStoredCellDose = (grid: BurnDoseGrid, cell: number): number =>
  ((grid.lineDose[cell] ?? 0) + (grid.fillDose[cell] ?? 0)) * (1 + BURN_DOSE_STORAGE_TOLERANCE_RATIO);

const getWallCellPrediction = (grid: BurnDoseGrid, cell: number, input: BurnPartsInput): BurnDepthPrediction =>
  getBurnDepthPrediction(getStoredCellDose(grid, cell), input.thicknessMm, input.basis);

const getWallLevelCells = (grid: BurnDoseGrid, input: BurnPartsInput): BurnWallLevelCells => {
  const throughCells: Uint8Array = new Uint8Array(grid.closedCutMask.length);
  const nearlyThroughCells: Uint8Array = new Uint8Array(grid.closedCutMask.length);

  for (const [cell, isWall] of grid.closedCutMask.entries()) {
    if (isWall) {
      const { level } = getWallCellPrediction(grid, cell, input);

      throughCells[cell] = level === CUT_DEPTH_LEVEL.THROUGH ? 1 : 0;
      nearlyThroughCells[cell] = level === CUT_DEPTH_LEVEL.NOT_THROUGH ? 0 : 1;
    }
  }

  return { throughCells, nearlyThroughCells };
};

const getRegionAreaMm2 = (region: BurnGridRegion, { cellMm }: BurnDoseGrid): number =>
  region.cellCount * cellMm * cellMm;

/** The lowest-dose wall cell along each region that does not cut through, by region number. */
const getWeakestWalls = (
  grid: BurnDoseGrid,
  regionNumbers: Int32Array,
  throughCells: Uint8Array,
): Map<number, BurnWeakestWall> => {
  const weakestWalls: Map<number, BurnWeakestWall> = new Map<number, BurnWeakestWall>();

  for (const [cell, isWall] of grid.closedCutMask.entries()) {
    if (isWall && !throughCells[cell]) {
      const dose: number = getStoredCellDose(grid, cell);

      for (const neighbourCell of getBurnGridNeighbourCells(cell, grid)) {
        const regionNumber: number = regionNumbers[neighbourCell] ?? BURN_REGION_LABEL_NONE;

        if (dose < (weakestWalls.get(regionNumber)?.dose ?? Number.POSITIVE_INFINITY)) {
          weakestWalls.set(regionNumber, { cell, dose });
        }
      }
    }
  }

  return weakestWalls;
};

const getRegionBoundsMm = (region: BurnGridRegion, grid: BurnDoseGrid): ToolpathBounds => ({
  minX: grid.originXMm + (region.minColumn - WALL_MIDDLE_CELL_OFFSET) * grid.cellMm,
  minY: grid.originYMm + (region.minRow - WALL_MIDDLE_CELL_OFFSET) * grid.cellMm,
  maxX: grid.originXMm + (region.maxColumn + 1 + WALL_MIDDLE_CELL_OFFSET) * grid.cellMm,
  maxY: grid.originYMm + (region.maxRow + 1 + WALL_MIDDLE_CELL_OFFSET) * grid.cellMm,
});

/** Part id of the nearest kept region around a region; a dropped region in between is looked through. */
const getParentPartId = (
  regionNumber: number,
  parents: Map<number, number>,
  partIds: Map<number, number>,
): number | undefined => {
  let parentNumber: number | undefined = parents.get(regionNumber);

  while (parentNumber && !partIds.has(parentNumber)) {
    parentNumber = parents.get(parentNumber);
  }

  return parentNumber ? partIds.get(parentNumber) : undefined;
};

/** The status the floods give: a cell the outside cannot reach through walls that cut through is sealed off. */
const getFloodStatus = (isFloodFree: boolean, isFloodNearlyFree: boolean): BurnPartStatus => {
  if (isFloodFree) {
    return BURN_PART_STATUS.FREE;
  }

  return isFloodNearlyFree ? BURN_PART_STATUS.BORDERLINE : BURN_PART_STATUS.NOT_THROUGH;
};

/** A sealed piece of joined regions lifts as its largest region; the others are only as free as their joining wall. */
const getAttachedRegionStatus = (joiningWallLevel: CutDepthLevel | undefined): BurnPartStatus =>
  (joiningWallLevel === CUT_DEPTH_LEVEL.NOT_THROUGH ? BURN_PART_STATUS.NOT_THROUGH : BURN_PART_STATUS.BORDERLINE);

const getPartRegionLabels = (regionNumbers: Int32Array, partIds: Map<number, number>): Int32Array => {
  const regionLabels: Int32Array = new Int32Array(regionNumbers.length);

  for (const [cell, regionNumber] of regionNumbers.entries()) {
    regionLabels[cell] = partIds.get(regionNumber) ?? BURN_REGION_LABEL_NONE;
  }

  return regionLabels;
};

export const getBurnParts = (grid: BurnDoseGrid, input: BurnPartsInput): BurnPartSet => {
  const { regions, regionNumbers }: BurnGridRegionSet = getBurnGridRegions(
    grid,
    getBurnGridOutsideCells(grid, grid.closedCutMask),
  );
  const keptRegions: BurnGridRegion[] = regions.filter(
    (region: BurnGridRegion): boolean => getRegionAreaMm2(region, grid) >= CUT_PART_MIN_AREA_MM2,
  );
  const partIds: Map<number, number> = new Map<number, number>(
    keptRegions.map((region: BurnGridRegion, regionIndex: number): [number, number] => [
      region.regionNumber,
      regionIndex + 1,
    ]),
  );
  const { throughCells, nearlyThroughCells }: BurnWallLevelCells = getWallLevelCells(grid, input);
  const freeFloodCells: Uint8Array = getBurnGridOutsideCells(grid, throughCells);
  const borderlineFloodCells: Uint8Array = getBurnGridOutsideCells(grid, nearlyThroughCells);
  const parents: Map<number, number> = getBurnRegionParents(grid, regionNumbers);
  const weakestWalls: Map<number, BurnWeakestWall> = getWeakestWalls(grid, regionNumbers, throughCells);
  const largestRegions: Map<number, BurnGridRegion> = getBurnAttachmentLargestRegions(grid, keptRegions, throughCells);

  const parts: BurnPart[] = keptRegions.map((region: BurnGridRegion, regionIndex: number): BurnPart => {
    const joiningWall: BurnWeakestWall | undefined = weakestWalls.get(region.regionNumber);
    const joiningPrediction: BurnDepthPrediction | undefined = joiningWall
      && getWallCellPrediction(grid, joiningWall.cell, input);
    const floodStatus: BurnPartStatus = getFloodStatus(
      !freeFloodCells[region.firstCell],
      !borderlineFloodCells[region.firstCell],
    );
    const largestRegion: BurnGridRegion | undefined = largestRegions.get(region.regionNumber);
    const isSealedAttachedRegion: boolean = floodStatus === BURN_PART_STATUS.FREE && largestRegion !== region;
    const status: BurnPartStatus = isSealedAttachedRegion
      ? getAttachedRegionStatus(joiningPrediction?.level)
      : floodStatus;
    const nestedParentId: number | undefined = getParentPartId(region.regionNumber, parents, partIds);
    const attachedParentId: number | undefined = isSealedAttachedRegion && largestRegion
      ? partIds.get(largestRegion.regionNumber)
      : undefined;
    const isFree: boolean = status === BURN_PART_STATUS.FREE;

    return {
      id: regionIndex + 1,
      parentId: nestedParentId ?? attachedParentId,
      status,
      boundsMm: getRegionBoundsMm(region, grid),
      weakestLayerKey: isFree || !joiningWall
        ? undefined
        : grid.layerKeys[grid.closedCutLayerIndex[joiningWall.cell] ?? 0],
      weakestDepthMm: isFree ? undefined : joiningPrediction?.depthMm,
    };
  });

  return { parts, regionLabels: getPartRegionLabels(regionNumbers, partIds) };
};
