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
import { getBurnScenePointer } from './get.burn.scene.pointer';

const POINTER_DOWN_EVENT = 'pointerdown';
const POINTER_MOVE_EVENT = 'pointermove';
const POINTER_UP_EVENT = 'pointerup';
const POINTER_CANCEL_EVENT = 'pointercancel';
const MAIN_POINTER_BUTTON = 0;

export const addBurnSceneClickListener = (
  canvas: HTMLCanvasElement,
  onSceneClick: (pointer: BurnScenePointer) => void,
): (() => void) => {
  let pressPoint: PointerEvent | undefined;

  const handlePointerDown = (pointerEvent: PointerEvent): void => {
    // A second finger means a pinch, not a click.
    const isSecondPointer: boolean = !!pressPoint && pressPoint.pointerId !== pointerEvent.pointerId;

    pressPoint = pointerEvent.button === MAIN_POINTER_BUTTON && !isSecondPointer ? pointerEvent : undefined;
  };
  const handlePointerMove = ({ clientX, clientY, pointerId }: PointerEvent): void => {
    const moveDistancePx: number = pressPoint?.pointerId === pointerId
      ? Math.hypot(clientX - (pressPoint?.clientX ?? clientX), clientY - (pressPoint?.clientY ?? clientY))
      : 0;

    if (moveDistancePx > BURN_SCENE_CLICK_MAX_MOVE_PX) {
      pressPoint = undefined;
    }
  };
  const handlePointerUp = (pointerEvent: PointerEvent): void => {
    handlePointerMove(pointerEvent);

    if (pressPoint?.pointerId === pointerEvent.pointerId) {
      onSceneClick(getBurnScenePointer(canvas, pointerEvent));
      pressPoint = undefined;
    }
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
