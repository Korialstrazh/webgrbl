/**
 * How the edge index of a paint area divides its height into horizontal bands.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ToolpathEdgeBandLayout {
  /** Bottom of the lowest band in bed mm. */
  minY: number;
  /** Height of every band in mm, above 0. */
  bandHeightMm: number;
  /** Number of bands, at least 1. */
  bandCount: number;
}
