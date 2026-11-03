/**
 * One connected area of grid cells enclosed by walls, before small areas are dropped.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
