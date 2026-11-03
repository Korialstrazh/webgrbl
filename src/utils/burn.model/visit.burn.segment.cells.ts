/**
 * Calls back with each grid cell a segment crosses, stepping one axis at a time, so that the cells of a segment always
 * share a side and a four-direction flood cannot slip through them at a corner.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnGridLayout } from './interfaces/BurnGridLayout';
import type { BurnSegment } from './interfaces/BurnSegment';

const getClampedCellIndex = (positionMm: number, originMm: number, cellMm: number, cellCount: number): number =>
  Math.min(Math.max(Math.floor((positionMm - originMm) / cellMm), 0), cellCount - 1);

/** The share of the segment before it first leaves the cell along one axis; infinite when it never moves that way. */
const getFirstBoundaryShare = (fromMm: number, toMm: number, boundaryMm: number): number =>
  (toMm === fromMm ? Number.POSITIVE_INFINITY : (boundaryMm - fromMm) / (toMm - fromMm));

export const visitBurnSegmentCells = (
  layout: BurnGridLayout,
  { from, to }: BurnSegment,
  visitCell: (cell: number) => void,
): void => {
  const { originXMm, originYMm, cellMm, columnCount, rowCount } = layout;
  let column: number = getClampedCellIndex(from.x, originXMm, cellMm, columnCount);
  let row: number = getClampedCellIndex(from.y, originYMm, cellMm, rowCount);
  const endColumn: number = getClampedCellIndex(to.x, originXMm, cellMm, columnCount);
  const endRow: number = getClampedCellIndex(to.y, originYMm, cellMm, rowCount);
  const columnStep: number = Math.sign(endColumn - column);
  const rowStep: number = Math.sign(endRow - row);
  const nextColumnEdge: number = originXMm + (column + Math.max(columnStep, 0)) * cellMm;
  const nextRowEdge: number = originYMm + (row + Math.max(rowStep, 0)) * cellMm;
  let columnShare: number = getFirstBoundaryShare(from.x, to.x, nextColumnEdge);
  let rowShare: number = getFirstBoundaryShare(from.y, to.y, nextRowEdge);
  const columnShareStep: number = cellMm / Math.abs(to.x - from.x);
  const rowShareStep: number = cellMm / Math.abs(to.y - from.y);

  visitCell(row * columnCount + column);

  // The step count is fixed by the end cell, so rounding errors in the shares can never overshoot or loop forever.
  while (column !== endColumn || row !== endRow) {
    const isColumnStepNext: boolean = row === endRow || (column !== endColumn && columnShare <= rowShare);

    if (isColumnStepNext) {
      column += columnStep;
      columnShare += columnShareStep;
    } else {
      row += rowStep;
      rowShare += rowShareStep;
    }

    visitCell(row * columnCount + column);
  }
};
