/**
 * How deep each cell of the sheet is burnt.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnCellDepths {
  /** 1 for a cell with no material left; otherwise 0. */
  throughCells: Uint8Array;
  /** Burn depth of each cell, counted in steps of BURN_DEPTH_QUANTUM_MM. */
  depthSteps: Int32Array;
}
