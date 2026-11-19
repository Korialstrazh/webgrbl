/**
 * What a pan step needs: the frame and how far the pointer moved since the last step.
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

export interface BedPanRequest extends BedViewportFrame {
  /** The pointer move, in CSS pixels; the bed follows the pointer. */
  pointerDelta: BedScreenPoint;
}
