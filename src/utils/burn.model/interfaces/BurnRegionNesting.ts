/**
 * How the regions of a burn dose grid lie inside each other.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnRegionNesting {
  /** Number of the region around each region; BURN_REGION_LABEL_NONE for the outside. */
  parents: Map<number, number>;
  /** Number of the wall through which each region was first reached: its wall to its parent and siblings. */
  outerWallNumbers: Map<number, number>;
  /** Wall number per cell, starting at 1; connected wall cells share a number. 0 for cells that are not walls. */
  wallNumbers: Int32Array;
}
