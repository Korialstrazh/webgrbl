/**
 * Lets the user drag the lift axis of the 3D scene up and down. A press on the axis never reaches the orbit controls or
 * the click selection. Returns a function that stops listening.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnScenePointPx } from '../../utils/burn.scene/interfaces/BurnScenePointPx';
import type { BurnSceneRenderer } from '../../utils/burn.scene/interfaces/BurnSceneRenderer';
import type { BurnLiftDragHandlers } from './interfaces/BurnLiftDragHandlers';

const POINTER_DOWN_EVENT = 'pointerdown';
const POINTER_MOVE_EVENT = 'pointermove';
const POINTER_UP_EVENT = 'pointerup';
const POINTER_CANCEL_EVENT = 'pointercancel';
const MAIN_POINTER_BUTTON = 0;
const LIFT_AXIS_CURSOR = 'ns-resize';
const DEFAULT_CURSOR = '';
// Before the listeners on the canvas that are not for capture, whenever those were added.
const CAPTURE_OPTIONS: AddEventListenerOptions = { capture: true };

const getScenePointPx = (canvas: HTMLCanvasElement, { clientX, clientY }: PointerEvent): BurnScenePointPx => {
  const { left, top }: DOMRect = canvas.getBoundingClientRect();

  return { xPx: clientX - left, yPx: clientY - top };
};

export const addBurnLiftDragListener = (
  canvas: HTMLCanvasElement,
  renderer: Pick<BurnSceneRenderer, 'isBurnLiftAxisAtPoint' | 'getBurnLiftChangeMm'>,
  { getLiftMm, setLiftMm }: BurnLiftDragHandlers,
): (() => void) => {
  let dragStart: PointerEvent | undefined;
  let dragStartLiftMm = 0;

  const handlePointerDown = (pointerEvent: PointerEvent): void => {
    const isOnAxis: boolean = pointerEvent.button === MAIN_POINTER_BUTTON
      && renderer.isBurnLiftAxisAtPoint(getScenePointPx(canvas, pointerEvent));

    if (!dragStart && !isOnAxis) {
      return;
    }

    pointerEvent.stopImmediatePropagation();

    if (!dragStart) {
      dragStart = pointerEvent;
      dragStartLiftMm = getLiftMm();
      canvas.setPointerCapture(pointerEvent.pointerId);
    }
  };
  const handlePointerMove = (pointerEvent: PointerEvent): void => {
    if (!dragStart) {
      // Off the arrow the hover listener sets the cursor, so only leaving the arrow clears it here.
      if (renderer.isBurnLiftAxisAtPoint(getScenePointPx(canvas, pointerEvent))) {
        canvas.style.cursor = LIFT_AXIS_CURSOR;
      } else if (canvas.style.cursor === LIFT_AXIS_CURSOR) {
        canvas.style.cursor = DEFAULT_CURSOR;
      }

      return;
    }

    pointerEvent.stopImmediatePropagation();

    if (pointerEvent.pointerId === dragStart.pointerId) {
      // From the start of the drag, not step by step: dragging below 0 and back returns to the pointer.
      setLiftMm(dragStartLiftMm + renderer.getBurnLiftChangeMm({
        xPx: pointerEvent.clientX - dragStart.clientX,
        yPx: pointerEvent.clientY - dragStart.clientY,
      }));
    }
  };
  const handlePointerEnd = (pointerEvent: PointerEvent): void => {
    if (dragStart) {
      pointerEvent.stopImmediatePropagation();
    }

    if (dragStart?.pointerId === pointerEvent.pointerId) {
      dragStart = undefined;
    }
  };

  canvas.addEventListener(POINTER_DOWN_EVENT, handlePointerDown, CAPTURE_OPTIONS);
  canvas.addEventListener(POINTER_MOVE_EVENT, handlePointerMove, CAPTURE_OPTIONS);
  canvas.addEventListener(POINTER_UP_EVENT, handlePointerEnd, CAPTURE_OPTIONS);
  canvas.addEventListener(POINTER_CANCEL_EVENT, handlePointerEnd, CAPTURE_OPTIONS);

  return () => {
    canvas.removeEventListener(POINTER_DOWN_EVENT, handlePointerDown, CAPTURE_OPTIONS);
    canvas.removeEventListener(POINTER_MOVE_EVENT, handlePointerMove, CAPTURE_OPTIONS);
    canvas.removeEventListener(POINTER_UP_EVENT, handlePointerEnd, CAPTURE_OPTIONS);
    canvas.removeEventListener(POINTER_CANCEL_EVENT, handlePointerEnd, CAPTURE_OPTIONS);
  };
};
