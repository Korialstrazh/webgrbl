/**
 * The edges of a paint area sorted into horizontal bands, so a scanline only looks at the edges of its own band.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathEdgeBandLayout } from './ToolpathEdgeBandLayout';

export interface ToolpathEdgeIndex extends ToolpathEdgeBandLayout {
  /** Per band from the bottom up, the edges that reach into it, as x0, y0, x1, y1 groups. */
  bands: Float64Array[];
}
