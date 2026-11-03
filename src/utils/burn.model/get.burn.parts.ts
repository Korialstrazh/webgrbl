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
  BURN_PART_STATUS,
  BURN_REGION_LABEL_NONE,
  CUT_DEPTH_LEVEL,
  CUT_PART_MIN_AREA_MM2,
} from './burn.model.constants';
import type { BurnPartStatus, CutDepthLevel } from './burn.model.constants';
import { getBurnAttachmentTrees } from './get.burn.attachment.trees';
import { getBurnDepthPrediction } from './get.burn.depth.prediction';
import { getBurnGridOutsideCells } from './get.burn.grid.outside.cells';
import { getBurnGridRegions } from './get.burn.grid.regions';
import { getBurnRegionParents } from './get.burn.region.parents';
import { getBurnStoredCellDose } from './get.burn.stored.cell.dose';
import { getBurnWallSides } from './get.burn.wall.sides';
import type { BurnAttachmentTrees } from './interfaces/BurnAttachmentTrees';
import type { BurnDepthPrediction } from './interfaces/BurnDepthPrediction';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnGridRegion } from './interfaces/BurnGridRegion';
import type { BurnGridRegionSet } from './interfaces/BurnGridRegionSet';
import type { BurnPart } from './interfaces/BurnPart';
import type { BurnPartSet } from './interfaces/BurnPartSet';
import type { BurnPartsInput } from './interfaces/BurnPartsInput';
import type { BurnWallLevelCells } from './interfaces/BurnWallLevelCells';
import type { BurnWallSides } from './interfaces/BurnWallSides';
import type { BurnWeakestWall } from './interfaces/BurnWeakestWall';
import type { ToolpathBounds } from '../toolpath/interfaces/ToolpathBounds';

/** A region's outermost cells touch its walls, so half a cell past them, on each side, is the middle of the wall. */
const WALL_MIDDLE_CELL_OFFSET = 0.5;

const getWallCellPrediction = (grid: BurnDoseGrid, cell: number, input: BurnPartsInput): BurnDepthPrediction =>
  getBurnDepthPrediction(getBurnStoredCellDose(grid, cell), input.thicknessMm, input.basis);

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

const getLowestDoseWall = (
  grid: BurnDoseGrid,
  wallCells: number[],
  isCellCounted: (cell: number) => boolean,
): BurnWeakestWall | undefined => {
  let lowestDoseWall: BurnWeakestWall | undefined;

  for (const cell of wallCells) {
    const dose: number = getBurnStoredCellDose(grid, cell);

    if (isCellCounted(cell) && dose < (lowestDoseWall?.dose ?? Number.POSITIVE_INFINITY)) {
      lowestDoseWall = { cell, dose };
    }
  }

  return lowestDoseWall;
};

/** Whether a wall cell of a region also faces something other than the region's own children. */
const isOwnWallCell = (
  sides: Set<number> | undefined,
  regionNumber: number,
  nestingParents: Map<number, number>,
): boolean => {
  const otherSides: number[] = [...(sides ?? [])].filter((side: number): boolean => side !== regionNumber);

  return !otherSides.length || otherSides.some((side: number): boolean => nestingParents.get(side) !== regionNumber);
};

const getRegionBoundsMm = (region: BurnGridRegion, grid: BurnDoseGrid): ToolpathBounds => ({
  minX: grid.originXMm + (region.minColumn - WALL_MIDDLE_CELL_OFFSET) * grid.cellMm,
  minY: grid.originYMm + (region.minRow - WALL_MIDDLE_CELL_OFFSET) * grid.cellMm,
  maxX: grid.originXMm + (region.maxColumn + 1 + WALL_MIDDLE_CELL_OFFSET) * grid.cellMm,
  maxY: grid.originYMm + (region.maxRow + 1 + WALL_MIDDLE_CELL_OFFSET) * grid.cellMm,
});

/** Part id of the nearest kept region up the given parents; undefined when the walk comes back to the region. */
const getParentPartId = (
  regionNumber: number,
  structureParents: Map<number, number>,
  partIds: Map<number, number>,
): number | undefined => {
  const seenRegionNumbers: Set<number> = new Set<number>([regionNumber]);
  let parentNumber: number | undefined = structureParents.get(regionNumber);

  while (parentNumber && !partIds.has(parentNumber) && !seenRegionNumbers.has(parentNumber)) {
    seenRegionNumbers.add(parentNumber);
    parentNumber = structureParents.get(parentNumber);
  }

  return parentNumber && !seenRegionNumbers.has(parentNumber) ? partIds.get(parentNumber) : undefined;
};

/** The status the floods give: a cell the outside cannot reach through walls that cut through is sealed off. */
const getFloodStatus = (isFloodFree: boolean, isFloodNearlyFree: boolean): BurnPartStatus => {
  if (isFloodFree) {
    return BURN_PART_STATUS.FREE;
  }

  return isFloodNearlyFree ? BURN_PART_STATUS.BORDERLINE : BURN_PART_STATUS.NOT_THROUGH;
};

/** A part is never more free than the wall it names. */
const getWallCappedStatus = (status: BurnPartStatus, wallLevel: CutDepthLevel | undefined): BurnPartStatus =>
  (wallLevel === CUT_DEPTH_LEVEL.NOT_THROUGH ? BURN_PART_STATUS.NOT_THROUGH : status);

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
  const nestingParents: Map<number, number> = getBurnRegionParents(grid, regionNumbers);
  const wallSides: BurnWallSides = getBurnWallSides(grid, regionNumbers, throughCells);
  const trees: BurnAttachmentTrees = getBurnAttachmentTrees(
    regions,
    (regionNumber: number): boolean => partIds.has(regionNumber),
    wallSides,
    nestingParents,
  );
  const structureParents: Map<number, number> = new Map<number, number>();

  for (const { regionNumber, firstCell } of regions) {
    const isSealed: boolean = !freeFloodCells[firstCell];
    const nestingParent: number | undefined = nestingParents.get(regionNumber);
    const treeParent: number | undefined = isSealed ? trees.treeParents.get(regionNumber) : undefined;
    const isNestingInsideGroup: boolean = isSealed && !!trees.groupMembers.get(regionNumber)?.has(nestingParent ?? 0);
    const parent: number | undefined = treeParent ?? (isNestingInsideGroup ? undefined : nestingParent);

    if (parent) {
      structureParents.set(regionNumber, parent);
    }
  }

  const parts: BurnPart[] = keptRegions.map((region: BurnGridRegion, regionIndex: number): BurnPart => {
    const { regionNumber } = region;
    const floodStatus: BurnPartStatus = getFloodStatus(
      !freeFloodCells[region.firstCell],
      !borderlineFloodCells[region.firstCell],
    );
    const treeParent: number | undefined = floodStatus === BURN_PART_STATUS.FREE
      && trees.representatives.get(regionNumber) !== regionNumber
      ? trees.treeParents.get(regionNumber)
      : undefined;
    const countedWall: BurnWeakestWall | undefined = getLowestDoseWall(
      grid,
      wallSides.cellsByRegion.get(regionNumber) ?? [],
      (cell: number): boolean => {
        const sides: Set<number> | undefined = wallSides.sidesByCell.get(cell);

        return treeParent ? !!sides?.has(treeParent) : isOwnWallCell(sides, regionNumber, nestingParents);
      },
    );
    const wallPrediction: BurnDepthPrediction | undefined = countedWall
      && getWallCellPrediction(grid, countedWall.cell, input);
    const isWallCapped: boolean = !!treeParent || floodStatus !== BURN_PART_STATUS.FREE;
    const status: BurnPartStatus = isWallCapped
      ? getWallCappedStatus(treeParent ? BURN_PART_STATUS.BORDERLINE : floodStatus, wallPrediction?.level)
      : floodStatus;
    const isFree: boolean = status === BURN_PART_STATUS.FREE;

    return {
      id: regionIndex + 1,
      parentId: getParentPartId(regionNumber, structureParents, partIds),
      status,
      boundsMm: getRegionBoundsMm(region, grid),
      weakestLayerKey: isFree || !countedWall
        ? undefined
        : grid.layerKeys[grid.closedCutLayerIndex[countedWall.cell] ?? 0],
      weakestDepthMm: isFree ? undefined : wallPrediction?.depthMm,
    };
  });

  return { parts, regionLabels: getPartRegionLabels(regionNumbers, partIds) };
};
