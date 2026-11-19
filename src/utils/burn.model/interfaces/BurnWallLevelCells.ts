/**
 * The wall cells of a burn dose grid by how deep they are predicted to cut.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnWallLevelCells {
  /** 1 for wall cells predicted to cut through. */
  throughCells: Uint8Array;
  /** 1 for wall cells predicted to cut through or nearly through. */
  nearlyThroughCells: Uint8Array;
}
