/**
 * Which regions each wall cell that does not cut through lies between.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnWallSides {
  /** Region numbers on the sides of each such wall cell; BURN_REGION_LABEL_NONE is the outside. */
  sidesByCell: Map<number, Set<number>>;
  /** The such wall cells that share a side with each region, by region number. */
  cellsByRegion: Map<number, number[]>;
}
