/**
 * The wall cell that gives way first around one region.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnWeakestWall {
  /** The wall cell. */
  cell: number;
  /** Rank of its predicted level: the lower, the further from cutting through. */
  levelRank: number;
  /** Its predicted depth in mm. */
  depthMm: number;
}
