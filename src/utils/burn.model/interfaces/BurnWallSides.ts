/**
 * Which regions each wall cell that does not cut through lies between.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnWallSides {
  /** Region numbers on the sides of each such wall cell; BURN_REGION_LABEL_NONE is the outside. */
  sidesByCell: Map<number, Set<number>>;
  /** The such wall cells that share a side with each region, by region number. */
  cellsByRegion: Map<number, number[]>;
}
