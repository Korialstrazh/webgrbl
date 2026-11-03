/**
 * Gets the dose every cell of the sheet receives from a toolpath. The cell count is rounded down, because rounding up
 * could exceed the cell limit; this gives up less than one cell of the sheet margin at the back and right.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { BURN_GRID_MAX_CELLS, BURN_GRID_MIN_CELL_MM, BURN_SHEET_MARGIN_MM } from './burn.model.constants';
import { getBurnChains } from './get.burn.chains';
import { getMoveDose } from './get.move.dose';
import type { BurnChain } from './interfaces/BurnChain';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnGridLayout } from './interfaces/BurnGridLayout';
import type { BurnSegment } from './interfaces/BurnSegment';
import { visitBurnSegmentCells } from './visit.burn.segment.cells';

const getBurnGridLayout = (toolpath: Toolpath): BurnGridLayout | undefined => {
  const { bounds, moves } = toolpath;

  if (!bounds) {
    return undefined;
  }

  // Bounds hold move ends only, so a job that burns from the very first point has that point to add. A first travel
  // starts away from the job, at the machine origin, and is not part of the sheet.
  const firstMove: ToolpathMove | undefined = moves[0];
  const startPoint: GeometryPoint = firstMove?.kind === TOOLPATH_MOVE_KIND.BURN
    ? firstMove.from
    : { x: bounds.minX, y: bounds.minY };
  const originXMm: number = Math.min(bounds.minX, startPoint.x) - BURN_SHEET_MARGIN_MM;
  const originYMm: number = Math.min(bounds.minY, startPoint.y) - BURN_SHEET_MARGIN_MM;
  const sheetWidthMm: number = Math.max(bounds.maxX, startPoint.x) + BURN_SHEET_MARGIN_MM - originXMm;
  const sheetHeightMm: number = Math.max(bounds.maxY, startPoint.y) + BURN_SHEET_MARGIN_MM - originYMm;
  const areaCellMm: number = Math.sqrt((sheetWidthMm * sheetHeightMm) / BURN_GRID_MAX_CELLS);
  const cellMm: number = Math.max(BURN_GRID_MIN_CELL_MM, areaCellMm);

  return {
    originXMm,
    originYMm,
    cellMm,
    columnCount: Math.floor(sheetWidthMm / cellMm),
    rowCount: Math.floor(sheetHeightMm / cellMm),
  };
};

/** The dose per cell of one chain: a cell it crosses several times still counts once, at the largest move dose. */
const getChainCellDoses = (layout: BurnGridLayout, chain: BurnChain): Map<number, number> => {
  const cellDoses: Map<number, number> = new Map<number, number>();

  const addSegment = (segment: BurnSegment, dose: number): void => {
    visitBurnSegmentCells(layout, segment, (cell: number): void => {
      cellDoses.set(cell, Math.max(cellDoses.get(cell) ?? 0, dose));
    });
  };

  for (const move of chain.moves) {
    addSegment(move, getMoveDose(move.powerPercent, move.feedMmPerMin));
  }

  const firstMove: ToolpathMove | undefined = chain.moves[0];
  const lastMove: ToolpathMove | undefined = chain.moves.at(-1);

  // A gap within the closed limit can still fall between two cells; bridging it keeps the wall unbroken.
  if (chain.isClosed && firstMove && lastMove) {
    addSegment({ from: lastMove.to, to: firstMove.from }, getMoveDose(lastMove.powerPercent, lastMove.feedMmPerMin));
  }

  return cellDoses;
};

const addLineDoses = (grid: BurnDoseGrid, chains: BurnChain[]): void => {
  const strongestChainDose: Float32Array = new Float32Array(grid.lineDose.length);

  for (const chain of chains) {
    const layerIndex: number = grid.layerKeys.indexOf(chain.layerKey);

    for (const [cell, dose] of getChainCellDoses(grid, chain)) {
      grid.lineDose[cell] = (grid.lineDose[cell] ?? 0) + dose;

      if (chain.isClosed && dose > (strongestChainDose[cell] ?? 0)) {
        strongestChainDose[cell] = dose;
        grid.closedCutMask[cell] = 1;
        grid.closedCutLayerIndex[cell] = layerIndex;
      }
    }
  }
};

const isEnabledFillLayer = (layer: ProjectLayer): boolean =>
  layer.enabled && layer.settings.mode === LAYER_MODE.FILL;

const isFillBurnMove = (move: ToolpathMove, layerKey: string): boolean =>
  move.layerKey === layerKey && move.kind === TOOLPATH_MOVE_KIND.BURN && move.powerPercent > 0;

const addFillLayerDoses = (grid: BurnDoseGrid, moves: ToolpathMove[], layer: ProjectLayer): void => {
  const layerKey: string = getLayerKey(layer);
  const largestMoveDose: Float32Array = new Float32Array(grid.fillDose.length);

  for (const move of moves) {
    if (isFillBurnMove(move, layerKey)) {
      const dose: number = getMoveDose(move.powerPercent, move.feedMmPerMin);

      visitBurnSegmentCells(grid, move, (cell: number): void => {
        largestMoveDose[cell] = Math.max(largestMoveDose[cell] ?? 0, dose);
      });
    }
  }

  for (const [cell, dose] of largestMoveDose.entries()) {
    if (dose) {
      grid.fillDose[cell] = (grid.fillDose[cell] ?? 0) + dose * layer.settings.passes;
    }
  }
};

export const getBurnDoseGrid = (toolpath: Toolpath, layers: ProjectLayer[]): BurnDoseGrid | undefined => {
  const layout: BurnGridLayout | undefined = getBurnGridLayout(toolpath);

  if (!layout) {
    return undefined;
  }

  const cellCount: number = layout.columnCount * layout.rowCount;
  const grid: BurnDoseGrid = {
    ...layout,
    lineDose: new Float32Array(cellCount),
    fillDose: new Float32Array(cellCount),
    closedCutMask: new Uint8Array(cellCount),
    closedCutLayerIndex: new Uint16Array(cellCount),
    layerKeys: layers.map((layer: ProjectLayer): string => getLayerKey(layer)),
  };

  addLineDoses(grid, getBurnChains(toolpath, layers));

  for (const layer of layers) {
    if (isEnabledFillLayer(layer)) {
      addFillLayerDoses(grid, toolpath.moves, layer);
    }
  }

  return grid;
};
