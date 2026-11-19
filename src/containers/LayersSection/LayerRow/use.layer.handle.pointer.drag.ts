/**
 * Lets touch and pen drag a layer by its handle: native drag and drop only works with a mouse, so the handle captures
 * the pointer and moves the layer to the place of each row the finger passes over.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useRef } from 'react';
import type { PointerEvent, RefObject } from 'react';
import type { LayerHandlePointerDragHandlers } from '../interfaces/LayerHandlePointerDragHandlers';
import { LAYER_ROW_KEY_ATTRIBUTE, LAYER_ROW_KEY_SELECTOR, MOUSE_POINTER_TYPE } from '../layers.section.constants';

const getLayerKeyUnderPointer = (pointerEvent: PointerEvent<HTMLElement>): string | undefined =>
  document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)
    ?.closest(LAYER_ROW_KEY_SELECTOR)
    ?.getAttribute(LAYER_ROW_KEY_ATTRIBUTE) ?? undefined;

export const useLayerHandlePointerDrag = (
  layerKey: string,
  onPointerDragOver: (targetKey: string) => void,
): LayerHandlePointerDragHandlers => {
  const draggingPointerIdRef: RefObject<number | undefined> = useRef<number | undefined>(undefined);

  const endPointerDrag = (pointerEvent: PointerEvent<HTMLElement>): void => {
    if (draggingPointerIdRef.current === pointerEvent.pointerId) {
      draggingPointerIdRef.current = undefined;
    }
  };

  return {
    onPointerDown: (pointerEvent: PointerEvent<HTMLElement>): void => {
      if (pointerEvent.pointerType === MOUSE_POINTER_TYPE) {
        return;
      }

      pointerEvent.currentTarget.setPointerCapture?.(pointerEvent.pointerId);
      draggingPointerIdRef.current = pointerEvent.pointerId;
    },
    onPointerMove: (pointerEvent: PointerEvent<HTMLElement>): void => {
      if (draggingPointerIdRef.current !== pointerEvent.pointerId) {
        return;
      }

      const targetKey: string | undefined = getLayerKeyUnderPointer(pointerEvent);

      if (targetKey && targetKey !== layerKey) {
        onPointerDragOver(targetKey);
      }
    },
    onPointerUp: endPointerDrag,
    onPointerCancel: endPointerDrag,
  };
};
