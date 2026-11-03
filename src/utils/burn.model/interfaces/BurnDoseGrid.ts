/**
 * The dose every cell of the sheet receives. Cells run row by row from the front-left corner.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnFillLayerDose } from './BurnFillLayerDose';

export interface BurnDoseGrid {
  /** Left edge of the sheet in bed mm. */
  originXMm: number;
  /** Front edge of the sheet in bed mm. */
  originYMm: number;
  /** Side of one square cell in mm. */
  cellMm: number;
  /** Number of cells from left to right. */
  columnCount: number;
  /** Number of cells from front to back. */
  rowCount: number;
  /** Dose of Line-mode layers per cell; each chain adds once. */
  lineDose: Float32Array;
  /** Dose of Fill-mode layers per cell; scan lines of one layer in one cell do not add. */
  fillDose: Float32Array;
  /** Fill dose of each enabled Fill-mode layer on its own; the layers add up to fillDose. */
  fillLayerDoses: BurnFillLayerDose[];
  /** 1 where a closed chain runs, so the cell is a wall between regions; otherwise 0. */
  closedCutMask: Uint8Array;
  /** Index into layerKeys of the closed chain with the largest dose in each wall cell. */
  closedCutLayerIndex: Uint16Array;
  /** Keys of the layers that closedCutLayerIndex points at. */
  layerKeys: string[];
}
