/**
 * What the pan gesture of the bed view gives: the pointer handlers of the view and whether a pan is ready or going on,
 * for the cursor.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MouseEvent, PointerEvent } from 'react';

export interface BedPanGesture {
  /** Space is held over the bed, so a left drag pans instead of editing. */
  isPanReady: boolean;
  /** A pan drag is going on. */
  isPanning: boolean;
  onPointerDownCapture: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerMove: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerUp: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onMouseDownCapture: (mouseEvent: MouseEvent<HTMLElement>) => void;
}
