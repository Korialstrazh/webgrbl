/**
 * The pointer handlers that let touch and pen drag a layer by its handle.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PointerEvent } from 'react';

export interface LayerHandlePointerDragHandlers {
  onPointerDown: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerMove: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerUp: (pointerEvent: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (pointerEvent: PointerEvent<HTMLElement>) => void;
}
