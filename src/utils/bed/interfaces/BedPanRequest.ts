/**
 * What a pan step needs: the frame and how far the pointer moved since the last step.
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

export interface BedPanRequest extends BedViewportFrame {
  /** The pointer move, in CSS pixels; the bed follows the pointer. */
  pointerDelta: BedScreenPoint;
}
