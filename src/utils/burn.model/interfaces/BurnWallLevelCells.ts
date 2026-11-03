/**
 * The wall cells of a burn dose grid by how deep they are predicted to cut.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnWallLevelCells {
  /** 1 for wall cells predicted to cut through. */
  throughCells: Uint8Array;
  /** 1 for wall cells predicted to cut through or nearly through. */
  nearlyThroughCells: Uint8Array;
}
