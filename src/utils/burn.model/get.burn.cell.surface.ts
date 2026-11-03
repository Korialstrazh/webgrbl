/**
 * Decides which mesh each cell of the sheet belongs to and how deep it is burnt. Through cells belong to none. A part
 * that is not through moves with its nearest liftable ancestor. So do the walls that remain between regions, because
 * each one goes to the outermost mesh it touches: a shallow engraving stays with the part it was burnt into, and a
 * wall around a lifted part stays behind in what is around that part.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BURN_CELL_NO_MESH,
  BURN_DEPTH_QUANTUM_MM,
  BURN_REGION_LABEL_NONE,
  BURN_SHEET_MESH_INDEX,
  CUT_DEPTH_LEVEL,
} from './burn.model.constants';
import { getBurnDepthPrediction } from './get.burn.depth.prediction';
import { getBurnGridOutsideCells } from './get.burn.grid.outside.cells';
import { getBurnStoredCellDose } from './get.burn.stored.cell.dose';
import type { BurnCellDepths } from './interfaces/BurnCellDepths';
import type { BurnCellSurface } from './interfaces/BurnCellSurface';
import type { BurnDepthPrediction } from './interfaces/BurnDepthPrediction';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnPart } from './interfaces/BurnPart';
import type { BurnPartSet } from './interfaces/BurnPartSet';
import type { BurnRegionMeshInput } from './interfaces/BurnRegionMeshInput';
import { isBurnPartLiftable } from './is.burn.part.liftable';
import { visitBurnGridNeighbourCells } from './visit.burn.grid.neighbour.cells';

/** A remaining wall cell before the flood gives it a mesh. */
const CELL_MESH_NOT_DECIDED = -2;

/** The nearest part up the tree, the part itself first, that can be lifted; undefined means the sheet. */
const getLiftingPart = (part: BurnPart, partsById: Map<number, BurnPart>): BurnPart | undefined => {
  const seenPartIds: Set<number> = new Set<number>();
  let currentPart: BurnPart | undefined = part;

  while (currentPart && !seenPartIds.has(currentPart.id)) {
    if (isBurnPartLiftable(currentPart)) {
      return currentPart;
    }

    seenPartIds.add(currentPart.id);
    currentPart = currentPart.parentId ? partsById.get(currentPart.parentId) : undefined;
  }

  return undefined;
};

const getPartTreeDepth = (part: BurnPart, partsById: Map<number, BurnPart>): number => {
  const seenPartIds: Set<number> = new Set<number>([part.id]);
  let parentPart: BurnPart | undefined = part.parentId ? partsById.get(part.parentId) : undefined;

  while (parentPart && !seenPartIds.has(parentPart.id)) {
    seenPartIds.add(parentPart.id);
    parentPart = parentPart.parentId ? partsById.get(parentPart.parentId) : undefined;
  }

  return seenPartIds.size;
};

const getCellMeshIndices = (
  grid: BurnDoseGrid,
  { regionLabels }: BurnPartSet,
  throughCells: Uint8Array,
  meshIndexByPartId: Map<number, number>,
): Int32Array => {
  const outsideCells: Uint8Array = getBurnGridOutsideCells(grid, grid.closedCutMask);
  const meshIndices: Int32Array = new Int32Array(regionLabels.length);

  for (const [cell, label] of regionLabels.entries()) {
    if (throughCells[cell]) {
      meshIndices[cell] = BURN_CELL_NO_MESH;
    } else if (label !== BURN_REGION_LABEL_NONE) {
      meshIndices[cell] = meshIndexByPartId.get(label) ?? BURN_SHEET_MESH_INDEX;
    } else {
      meshIndices[cell] = outsideCells[cell] ? BURN_SHEET_MESH_INDEX : CELL_MESH_NOT_DECIDED;
    }
  }

  return meshIndices;
};

/** Spreads each mesh over the undecided cells it touches, the outermost meshes first so that they win. */
const decideRemainingCellMeshes = (grid: BurnDoseGrid, meshIndices: Int32Array, meshDepths: number[]): void => {
  const seedCellsByDepth: Map<number, Set<number>> = new Map<number, Set<number>>();

  for (const [cell, meshIndex] of meshIndices.entries()) {
    if (meshIndex === CELL_MESH_NOT_DECIDED) {
      visitBurnGridNeighbourCells(cell, grid, (neighbourCell: number): void => {
        const neighbourMeshIndex: number = meshIndices[neighbourCell] ?? BURN_CELL_NO_MESH;

        if (neighbourMeshIndex >= 0) {
          const depth: number = meshDepths[neighbourMeshIndex] ?? 0;
          const seedCells: Set<number> = seedCellsByDepth.get(depth) ?? new Set<number>();

          seedCells.add(neighbourCell);
          seedCellsByDepth.set(depth, seedCells);
        }
      });
    }
  }

  const depthsOutermostFirst: number[] = [...seedCellsByDepth.keys()].sort(
    (first: number, second: number): number => first - second,
  );

  for (const depth of depthsOutermostFirst) {
    const pendingCells: number[] = [...(seedCellsByDepth.get(depth) ?? [])];

    // for-of also walks the cells added while it runs.
    for (const cell of pendingCells) {
      visitBurnGridNeighbourCells(cell, grid, (neighbourCell: number): void => {
        if (meshIndices[neighbourCell] === CELL_MESH_NOT_DECIDED) {
          meshIndices[neighbourCell] = meshIndices[cell] ?? BURN_SHEET_MESH_INDEX;
          pendingCells.push(neighbourCell);
        }
      });
    }
  }

  // Only a tiny scrap sealed off by through walls is left; it drops out, and the sheet is as good a place as any.
  for (const [cell, meshIndex] of meshIndices.entries()) {
    if (meshIndex === CELL_MESH_NOT_DECIDED) {
      meshIndices[cell] = BURN_SHEET_MESH_INDEX;
    }
  }
};

/** The depth of each cell and which cells have nothing left; a cell not through keeps a floor, however deep. */
const getCellDepths = (grid: BurnDoseGrid, { thicknessMm, basis }: BurnRegionMeshInput): BurnCellDepths => {
  const cellCount: number = grid.lineDose.length;
  const throughCells: Uint8Array = new Uint8Array(cellCount);
  const depthSteps: Int32Array = new Int32Array(cellCount);
  const maxDepthStep: number = Math.max(0, Math.ceil(thicknessMm / BURN_DEPTH_QUANTUM_MM) - 1);

  for (let cell = 0; cell < cellCount; cell++) {
    const dose: number = getBurnStoredCellDose(grid, cell);

    if (dose) {
      const { depthMm, level }: BurnDepthPrediction = getBurnDepthPrediction(dose, thicknessMm, basis);

      throughCells[cell] = level === CUT_DEPTH_LEVEL.THROUGH ? 1 : 0;
      depthSteps[cell] = Math.min(maxDepthStep, Math.round(depthMm / BURN_DEPTH_QUANTUM_MM));
    }
  }

  return { throughCells, depthSteps };
};

const getMeshIndexByPartId = (parts: BurnPart[], partsById: Map<number, BurnPart>): Map<number, number> => {
  const meshIndexOfLiftablePart: Map<number, number> = new Map<number, number>(
    parts.filter(isBurnPartLiftable).map(
      (part: BurnPart, partIndex: number): [number, number] => [part.id, partIndex + 1],
    ),
  );
  const meshIndexByPartId: Map<number, number> = new Map<number, number>();

  for (const part of parts) {
    const liftingPart: BurnPart | undefined = getLiftingPart(part, partsById);

    meshIndexByPartId.set(part.id, meshIndexOfLiftablePart.get(liftingPart?.id ?? 0) ?? BURN_SHEET_MESH_INDEX);
  }

  return meshIndexByPartId;
};

export const getBurnCellSurface = (
  grid: BurnDoseGrid,
  partSet: BurnPartSet,
  input: BurnRegionMeshInput,
): BurnCellSurface => {
  const { parts } = partSet;
  const partsById: Map<number, BurnPart> = new Map<number, BurnPart>(
    parts.map((part: BurnPart): [number, BurnPart] => [part.id, part]),
  );
  const { throughCells, depthSteps }: BurnCellDepths = getCellDepths(grid, input);
  const meshDepths: number[] = [
    0,
    ...parts.filter(isBurnPartLiftable).map((part: BurnPart): number => getPartTreeDepth(part, partsById)),
  ];
  const meshIndices: Int32Array = getCellMeshIndices(
    grid,
    partSet,
    throughCells,
    getMeshIndexByPartId(parts, partsById),
  );

  decideRemainingCellMeshes(grid, meshIndices, meshDepths);

  return {
    originXMm: grid.originXMm,
    originYMm: grid.originYMm,
    cellMm: grid.cellMm,
    columnCount: grid.columnCount,
    rowCount: grid.rowCount,
    meshIndices,
    depthSteps,
    thicknessMm: input.thicknessMm,
  };
};
