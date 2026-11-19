/**
 * A place or a pointer move in the 3D view, in CSS pixels; y grows downwards, as on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnScenePointPx {
  /** Pixels to the right of the left edge of the view, or moved to the right. */
  xPx: number;
  /** Pixels below the top edge of the view, or moved downwards. */
  yPx: number;
}
