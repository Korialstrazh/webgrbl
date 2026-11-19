/**
 * What a zoom step needs: the frame, the view point that stays under the pointer, and how much larger the bed gets.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedScreenPoint } from './BedScreenPoint';
import type { BedViewportFrame } from './BedViewportFrame';

export interface BedZoomRequest extends BedViewportFrame {
  /** The view point that keeps showing the same bed point, usually the pointer or the view centre. */
  anchorPoint: BedScreenPoint;
  /** Above 1 zooms in, below 1 zooms out. */
  zoomFactor: number;
}
