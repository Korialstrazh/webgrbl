/**
 * A place or a pointer move in the 3D view, in CSS pixels; y grows downwards, as on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnScenePointPx {
  /** Pixels to the right of the left edge of the view, or moved to the right. */
  xPx: number;
  /** Pixels below the top edge of the view, or moved downwards. */
  yPx: number;
}
