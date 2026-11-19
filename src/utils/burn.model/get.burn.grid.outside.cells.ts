/**
 * Gets the cells the outside of the sheet reaches when the given cells are walls: 1 for reached, otherwise 0.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnGridLayout } from './interfaces/BurnGridLayout';
import { visitBurnGridConnectedCells } from './visit.burn.grid.connected.cells';

const getBurnGridBorderCells = ({ columnCount, rowCount }: BurnGridLayout): number[] => {
  const borderCells: number[] = [];

  for (let column = 0; column < columnCount; column++) {
    borderCells.push(column, (rowCount - 1) * columnCount + column);
  }

  for (let row = 0; row < rowCount; row++) {
    borderCells.push(row * columnCount, row * columnCount + columnCount - 1);
  }

  return borderCells;
};

export const getBurnGridOutsideCells = (layout: BurnGridLayout, wallCells: Uint8Array): Uint8Array => {
  const outsideCells: Uint8Array = new Uint8Array(wallCells.length);

  visitBurnGridConnectedCells(
    layout,
    getBurnGridBorderCells(layout),
    (cell: number): boolean => !wallCells[cell] && !outsideCells[cell],
    (cell: number): void => {
      outsideCells[cell] = 1;
    },
  );

  return outsideCells;
};
