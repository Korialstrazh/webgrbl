/**
 * The wall cell that gives way first around one region.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnWeakestWall {
  /** The wall cell. */
  cell: number;
  /** Rank of its predicted level: the lower, the further from cutting through. */
  levelRank: number;
  /** Its predicted depth in mm. */
  depthMm: number;
}
