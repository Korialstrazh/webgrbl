/**
 * Which mesh every cell of the sheet belongs to and how deep it is burnt, ready to turn into quads.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnGridLayout } from './BurnGridLayout';

export interface BurnCellSurface extends BurnGridLayout {
  /** Index of the mesh of each cell; BURN_CELL_NO_MESH for a cell with no material left. */
  meshIndices: Int32Array;
  /** Burn depth of each cell, counted in steps of BURN_DEPTH_QUANTUM_MM. */
  depthSteps: Int32Array;
  /** Thickness of the sheet in mm. */
  thicknessMm: number;
}
