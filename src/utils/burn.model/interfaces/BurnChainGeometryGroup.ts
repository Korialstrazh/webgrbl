/**
 * Chains that burn one groove: the same points, whichever corner or direction each one started from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
