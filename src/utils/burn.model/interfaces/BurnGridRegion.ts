/**
 * One connected area of grid cells enclosed by walls, before small areas are dropped.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnGridRegion {
  /** Number of the region; regions are numbered in the order a row-by-row scan meets them, starting at 1. */
  regionNumber: number;
  /** The first cell the scan met. */
  firstCell: number;
  /** How many cells the region has. */
  cellCount: number;
  /** Leftmost column. */
  minColumn: number;
  /** Rightmost column. */
  maxColumn: number;
  /** Front row. */
  minRow: number;
  /** Back row. */
  maxRow: number;
}
