/**
 * The pointer handlers that let touch and pen drag a layer by its handle.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PointerEvent } from 'react';

export interface LayerHandlePointerDragHandlers {
  onPointerDown: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerMove: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerUp: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (pointerEvent: PointerEvent<HTMLElement>) => void;
}
