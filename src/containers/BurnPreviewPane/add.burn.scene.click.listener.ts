/**
 * Fires when the user clicks the 3D scene without dragging it, because a drag only moves the camera. Returns a function
 * that stops listening.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_SCENE_CLICK_MAX_MOVE_PX } from '../../utils/burn.scene/burn.scene.constants';
import type { BurnScenePointer } from '../../utils/burn.scene/interfaces/BurnScenePointer';

const POINTER_DOWN_EVENT = 'pointerdown';
const POINTER_MOVE_EVENT = 'pointermove';
const POINTER_UP_EVENT = 'pointerup';
const POINTER_CANCEL_EVENT = 'pointercancel';
const MAIN_POINTER_BUTTON = 0;
const NDC_SPAN = 2;

const getBurnScenePointer = (canvas: HTMLCanvasElement, { clientX, clientY }: PointerEvent): BurnScenePointer => {
  const { left, top, width, height }: DOMRect = canvas.getBoundingClientRect();

  return {
    xNdc: ((clientX - left) / width) * NDC_SPAN - 1,
    yNdc: 1 - ((clientY - top) / height) * NDC_SPAN,
  };
};

export const addBurnSceneClickListener = (
  canvas: HTMLCanvasElement,
  onSceneClick: (pointer: BurnScenePointer) => void,
): (() => void) => {
  let pressPoint: PointerEvent | undefined;

  const handlePointerDown = (pointerEvent: PointerEvent): void => {
    pressPoint = pointerEvent.button === MAIN_POINTER_BUTTON ? pointerEvent : undefined;
  };
  const handlePointerMove = ({ clientX, clientY }: PointerEvent): void => {
    const moveDistancePx: number = pressPoint
      ? Math.hypot(clientX - pressPoint.clientX, clientY - pressPoint.clientY)
      : 0;

    if (moveDistancePx > BURN_SCENE_CLICK_MAX_MOVE_PX) {
      pressPoint = undefined;
    }
  };
  const handlePointerUp = (pointerEvent: PointerEvent): void => {
    handlePointerMove(pointerEvent);

    if (pressPoint) {
      onSceneClick(getBurnScenePointer(canvas, pointerEvent));
    }

    pressPoint = undefined;
  };
  const handlePointerCancel = (): void => {
    pressPoint = undefined;
  };

  canvas.addEventListener(POINTER_DOWN_EVENT, handlePointerDown);
  canvas.addEventListener(POINTER_MOVE_EVENT, handlePointerMove);
  canvas.addEventListener(POINTER_UP_EVENT, handlePointerUp);
  canvas.addEventListener(POINTER_CANCEL_EVENT, handlePointerCancel);

  return () => {
    canvas.removeEventListener(POINTER_DOWN_EVENT, handlePointerDown);
    canvas.removeEventListener(POINTER_MOVE_EVENT, handlePointerMove);
    canvas.removeEventListener(POINTER_UP_EVENT, handlePointerUp);
    canvas.removeEventListener(POINTER_CANCEL_EVENT, handlePointerCancel);
  };
};
