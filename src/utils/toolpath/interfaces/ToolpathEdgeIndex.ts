/**
 * The edges of a paint area sorted into horizontal bands, so a scanline only looks at the edges of its own band.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathEdgeBandLayout } from './ToolpathEdgeBandLayout';

export interface ToolpathEdgeIndex extends ToolpathEdgeBandLayout {
  /** Per band from the bottom up, the edges that reach into it, as x0, y0, x1, y1 groups. */
  bands: Float64Array[];
}
