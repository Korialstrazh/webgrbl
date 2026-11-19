/**
 * The dose per cell of one chain, in the two ways the grid needs it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnChainCellDoses {
  /** Largest move dose per cell the chain crosses. */
  largestDoses: Map<number, number>;
  /** Smallest move dose per cell the chain crosses. */
  weakestDoses: Map<number, number>;
}
