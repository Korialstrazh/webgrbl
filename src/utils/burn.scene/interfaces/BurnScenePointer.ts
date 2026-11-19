/**
 * A place in the 3D view in normalized device coordinates: -1 to 1 across, and from bottom to top.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnScenePointer {
  /** From -1 at the left edge to 1 at the right edge. */
  xNdc: number;
  /** From -1 at the bottom edge to 1 at the top edge. */
  yNdc: number;
}
