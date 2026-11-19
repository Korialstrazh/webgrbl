/**
 * Chains that burn one groove: the same points, whichever corner or direction each one started from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { BurnChain } from './BurnChain';

export interface BurnChainGeometryGroup {
  /** The points of the first chain of the group, without a closing point that repeats the first. */
  points: GeometryPoint[];
  /** Whether the chains of the group are closed. */
  isClosed: boolean;
  /** Every chain with this geometry, in burn order. */
  chains: BurnChain[];
}
