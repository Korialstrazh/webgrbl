/**
 * A place in the 3D view in normalized device coordinates: -1 to 1 across, and from bottom to top.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnScenePointer {
  /** From -1 at the left edge to 1 at the right edge. */
  xNdc: number;
  /** From -1 at the bottom edge to 1 at the top edge. */
  yNdc: number;
}
