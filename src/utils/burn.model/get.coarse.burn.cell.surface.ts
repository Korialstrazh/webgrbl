/**
 * Gets a surface of bigger cells, each made of a square block of cells. A block with any cell of no material has none
 * itself, so a cut stays open however coarse the surface gets; it only looks wider.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BURN_CELL_NO_MESH } from './burn.model.constants';
import type { BurnCellSurface } from './interfaces/BurnCellSurface';

export const getCoarseBurnCellSurface = (surface: BurnCellSurface, blockSize: number): BurnCellSurface => {
  const columnCount: number = Math.ceil(surface.columnCount / blockSize);
  const rowCount: number = Math.ceil(surface.rowCount / blockSize);
  const meshIndices: Int32Array = new Int32Array(columnCount * rowCount);
  const depthSteps: Int32Array = new Int32Array(columnCount * rowCount);
  const hasFilledBlock: Uint8Array = new Uint8Array(columnCount * rowCount);

  for (const [cell, meshIndex] of surface.meshIndices.entries()) {
    const column: number = Math.floor((cell % surface.columnCount) / blockSize);
    const row: number = Math.floor(Math.floor(cell / surface.columnCount) / blockSize);
    const block: number = row * columnCount + column;

    if (meshIndex === BURN_CELL_NO_MESH || meshIndices[block] === BURN_CELL_NO_MESH) {
      meshIndices[block] = BURN_CELL_NO_MESH;
    } else if (!hasFilledBlock[block]) {
      hasFilledBlock[block] = 1;
      meshIndices[block] = meshIndex;
    }

    depthSteps[block] = Math.max(depthSteps[block] ?? 0, surface.depthSteps[cell] ?? 0);
  }

  return {
    ...surface,
    cellMm: surface.cellMm * blockSize,
    columnCount,
    rowCount,
    meshIndices,
    depthSteps,
  };
};
