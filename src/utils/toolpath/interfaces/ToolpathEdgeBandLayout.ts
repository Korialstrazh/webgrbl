/**
 * How the edge index of a paint area divides its height into horizontal bands.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ToolpathEdgeBandLayout {
  /** Bottom of the lowest band in bed mm. */
  minY: number;
  /** Height of every band in mm, above 0. */
  bandHeightMm: number;
  /** Number of bands, at least 1. */
  bandCount: number;
}
