/**
 * What a zoom step needs: the frame, the view point that stays under the pointer, and how much larger the bed gets.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedScreenPoint } from './BedScreenPoint';
import type { BedViewportFrame } from './BedViewportFrame';

export interface BedZoomRequest extends BedViewportFrame {
  /** The view point that keeps showing the same bed point, usually the pointer or the view centre. */
  anchorPoint: BedScreenPoint;
  /** Above 1 zooms in, below 1 zooms out. */
  zoomFactor: number;
}
