/**
 * The dose per cell of one chain, in the two ways the grid needs it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnChainCellDoses {
  /** Largest move dose per cell the chain crosses. */
  largestDoses: Map<number, number>;
  /** Smallest move dose per cell the chain crosses. */
  weakestDoses: Map<number, number>;
}
