/**
 * Visits the faces of a cell surface: for each run of equal cells in a row, a top, a bottom and the side walls where
 * the height changes or the mesh ends. Walls along a row merge too, so a flat sheet stays a few quads per row.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_CELL_NO_MESH, BURN_DEPTH_QUANTUM_MM } from './burn.model.constants';
import type { BurnCellSurface } from './interfaces/BurnCellSurface';
import type { BurnMeshQuad } from './interfaces/BurnMeshQuad';

const FULLY_BURNT_SHADE = 1;
const CLEAN_SHADE = 0;
const OUTSIDE_THE_GRID = -1;
/** Offset from the first cell of a run to the cell on its left, and from the last cell to the cell on its right. */
const LEFT_COLUMN_OFFSET = -1;
const RIGHT_COLUMN_OFFSET = 1;

const getCellTopMm = (surface: BurnCellSurface, cell: number): number =>
  surface.thicknessMm - (surface.depthSteps[cell] ?? 0) * BURN_DEPTH_QUANTUM_MM;

const getCellShade = (surface: BurnCellSurface, cell: number): number =>
  Math.min(FULLY_BURNT_SHADE, ((surface.depthSteps[cell] ?? 0) * BURN_DEPTH_QUANTUM_MM) / surface.thicknessMm);

/** Whether the cell has a face toward the other cell: the other is in another mesh, or lower in this one. */
const hasWallToward = (surface: BurnCellSurface, cell: number, otherCell: number): boolean =>
  surface.meshIndices[otherCell] !== surface.meshIndices[cell]
  || getCellTopMm(surface, otherCell) < getCellTopMm(surface, cell);

const getWallBottomMm = (surface: BurnCellSurface, cell: number, otherCell: number): number =>
  (surface.meshIndices[otherCell] === surface.meshIndices[cell] ? getCellTopMm(surface, otherCell) : 0);

/** A wall inside a mesh shows the burn of the lower cell, and a cut edge is burnt; the other walls are clean. */
const getWallShade = (surface: BurnCellSurface, cell: number, otherCell: number): number => {
  if (surface.meshIndices[otherCell] === surface.meshIndices[cell]) {
    return getCellShade(surface, otherCell);
  }

  return surface.meshIndices[otherCell] === BURN_CELL_NO_MESH ? FULLY_BURNT_SHADE : getCellShade(surface, cell);
};

const hasCellGeometry = (surface: BurnCellSurface, cell: number): boolean =>
  surface.meshIndices[cell] !== BURN_CELL_NO_MESH;

/** Whether a wall of a row runs on across the next cell, with the same height and look. */
const isSameRowWall = (surface: BurnCellSurface, cell: number, nextCell: number, offset: number): boolean =>
  getCellTopMm(surface, cell) === getCellTopMm(surface, nextCell)
  && hasRowWall(surface, nextCell, offset)
  && getRowWallBottomMm(surface, cell, offset) === getRowWallBottomMm(surface, nextCell, offset)
  && getRowWallShade(surface, cell, offset) === getRowWallShade(surface, nextCell, offset);

/** The cell in the row in front of or behind the cell; OUTSIDE_THE_GRID past the sheet. */
const getOtherRowCell = (surface: BurnCellSurface, cell: number, offset: number): number => {
  const otherCell: number = cell + offset;

  return otherCell >= 0 && otherCell < surface.meshIndices.length ? otherCell : OUTSIDE_THE_GRID;
};

const hasRowWall = (surface: BurnCellSurface, cell: number, offset: number): boolean => {
  const otherCell: number = getOtherRowCell(surface, cell, offset);

  return otherCell === OUTSIDE_THE_GRID || hasWallToward(surface, cell, otherCell);
};

const getRowWallBottomMm = (surface: BurnCellSurface, cell: number, offset: number): number => {
  const otherCell: number = getOtherRowCell(surface, cell, offset);

  return otherCell === OUTSIDE_THE_GRID ? 0 : getWallBottomMm(surface, cell, otherCell);
};

const getRowWallShade = (surface: BurnCellSurface, cell: number, offset: number): number => {
  const otherCell: number = getOtherRowCell(surface, cell, offset);

  return otherCell === OUTSIDE_THE_GRID ? CLEAN_SHADE : getWallShade(surface, cell, otherCell);
};

const getRowFaceCorners = (x0: number, x1: number, y: number, bottomMm: number, topMm: number): number[] =>
  [x0, y, bottomMm, x1, y, bottomMm, x1, y, topMm, x0, y, topMm];

/** Visits the walls in front of (negative offset) or behind (positive offset) a run of cells, merged along the row. */
const visitRunRowWalls = (
  surface: BurnCellSurface,
  [firstColumn, endColumn, row]: [number, number, number],
  offset: number,
  visitQuad: (quad: BurnMeshQuad) => void,
): void => {
  const { originXMm, originYMm, cellMm, columnCount } = surface;
  const rowCellStart: number = row * columnCount;
  const isBack: boolean = offset > 0;
  const y: number = originYMm + (isBack ? row + 1 : row) * cellMm;
  let column: number = firstColumn;

  while (column < endColumn) {
    const cell: number = rowCellStart + column;
    const hasWall: boolean = hasRowWall(surface, cell, offset);
    let wallEndColumn: number = column + 1;

    while (
      hasWall
      && wallEndColumn < endColumn
      && isSameRowWall(surface, cell, rowCellStart + wallEndColumn, offset)
    ) {
      wallEndColumn++;
    }

    if (hasWall) {
      const x0: number = originXMm + column * cellMm;
      const x1: number = originXMm + wallEndColumn * cellMm;

      visitQuad({
        meshIndex: surface.meshIndices[cell] ?? 0,
        corners: isBack
          ? getRowFaceCorners(x1, x0, y, getRowWallBottomMm(surface, cell, offset), getCellTopMm(surface, cell))
          : getRowFaceCorners(x0, x1, y, getRowWallBottomMm(surface, cell, offset), getCellTopMm(surface, cell)),
        shade: getRowWallShade(surface, cell, offset),
      });
    }

    column = wallEndColumn;
  }
};

/** Visits the wall at the left or right end of a run, which faces the neighbouring cell of the same row. */
const visitRunEndWall = (
  surface: BurnCellSurface,
  [column, row, offset]: [number, number, number],
  visitQuad: (quad: BurnMeshQuad) => void,
): void => {
  const { originXMm, originYMm, cellMm, columnCount } = surface;
  const cell: number = row * columnCount + column;
  const otherColumn: number = column + offset;
  const isOutside: boolean = otherColumn < 0 || otherColumn >= columnCount;
  const otherCell: number = row * columnCount + otherColumn;

  if (!isOutside && !hasWallToward(surface, cell, otherCell)) {
    return;
  }

  const bottomMm: number = isOutside ? 0 : getWallBottomMm(surface, cell, otherCell);
  const topMm: number = getCellTopMm(surface, cell);
  const isRight: boolean = offset > 0;
  const x: number = originXMm + (isRight ? column + 1 : column) * cellMm;
  const y0: number = originYMm + (isRight ? row : row + 1) * cellMm;
  const y1: number = originYMm + (isRight ? row + 1 : row) * cellMm;

  visitQuad({
    meshIndex: surface.meshIndices[cell] ?? 0,
    corners: [x, y0, bottomMm, x, y1, bottomMm, x, y1, topMm, x, y0, topMm],
    shade: isOutside ? CLEAN_SHADE : getWallShade(surface, cell, otherCell),
  });
};

const visitRunFlatFaces = (
  surface: BurnCellSurface,
  [firstColumn, endColumn, row]: [number, number, number],
  visitQuad: (quad: BurnMeshQuad) => void,
): void => {
  const { originXMm, originYMm, cellMm, columnCount } = surface;
  const cell: number = row * columnCount + firstColumn;
  const meshIndex: number = surface.meshIndices[cell] ?? 0;
  const x0: number = originXMm + firstColumn * cellMm;
  const x1: number = originXMm + endColumn * cellMm;
  const y0: number = originYMm + row * cellMm;
  const y1: number = originYMm + (row + 1) * cellMm;
  const topMm: number = getCellTopMm(surface, cell);

  visitQuad({
    meshIndex,
    corners: [x0, y0, topMm, x1, y0, topMm, x1, y1, topMm, x0, y1, topMm],
    shade: getCellShade(surface, cell),
  });
  visitQuad({ meshIndex, corners: [x0, y1, 0, x1, y1, 0, x1, y0, 0, x0, y0, 0], shade: CLEAN_SHADE });
};

const getRunEndColumn = (surface: BurnCellSurface, firstColumn: number, row: number): number => {
  const rowCellStart: number = row * surface.columnCount;
  const firstCell: number = rowCellStart + firstColumn;
  let endColumn: number = firstColumn + 1;

  while (
    endColumn < surface.columnCount
    && surface.meshIndices[rowCellStart + endColumn] === surface.meshIndices[firstCell]
    && surface.depthSteps[rowCellStart + endColumn] === surface.depthSteps[firstCell]
  ) {
    endColumn++;
  }

  return endColumn;
};

export const visitBurnSurfaceQuads = (surface: BurnCellSurface, visitQuad: (quad: BurnMeshQuad) => void): void => {
  const { columnCount, rowCount } = surface;

  for (let row = 0; row < rowCount; row++) {
    let column = 0;

    while (column < columnCount) {
      const endColumn: number = getRunEndColumn(surface, column, row);

      if (hasCellGeometry(surface, row * columnCount + column)) {
        visitRunFlatFaces(surface, [column, endColumn, row], visitQuad);
        visitRunEndWall(surface, [column, row, LEFT_COLUMN_OFFSET], visitQuad);
        visitRunEndWall(surface, [endColumn - 1, row, RIGHT_COLUMN_OFFSET], visitQuad);
        visitRunRowWalls(surface, [column, endColumn, row], -columnCount, visitQuad);
        visitRunRowWalls(surface, [column, endColumn, row], columnCount, visitQuad);
      }

      column = endColumn;
    }
  }
};
