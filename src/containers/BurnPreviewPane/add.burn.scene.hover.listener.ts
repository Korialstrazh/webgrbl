/**
 * Tells which part a mouse is over in the 3D scene and shows the pointer cursor there. A ray through a big model costs real time, so it runs at most once per interval, never for a finger and never during a drag. Returns a function that stops listening.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_SCENE_HOVER_MIN_INTERVAL_MS } from '../../utils/burn.scene/burn.scene.constants';
import type { BurnSceneRenderer } from '../../utils/burn.scene/interfaces/BurnSceneRenderer';
import { getBurnScenePointer } from './get.burn.scene.pointer';

const POINTER_MOVE_EVENT = 'pointermove';
const POINTER_LEAVE_EVENT = 'pointerleave';
const TOUCH_POINTER_TYPE = 'touch';
const PART_CURSOR = 'pointer';
const DEFAULT_CURSOR = '';

const isBurnSceneHoverMove = ({ pointerType, buttons }: PointerEvent): boolean =>
  pointerType !== TOUCH_POINTER_TYPE && !buttons;

export const addBurnSceneHoverListener = (
  canvas: HTMLCanvasElement,
  renderer: Pick<BurnSceneRenderer, 'getBurnPartIdAtPointer' | 'isBurnLiftAxisAtPoint'>,
  onPartHovered: (partId: number | undefined) => void,
): (() => void) => {
  let latestMove: PointerEvent | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let hoveredPartId: number | undefined;

  const stopTimer = (): void => {
    clearTimeout(timerId);
    timerId = undefined;
    latestMove = undefined;
  };
  const reportHoveredPart = (partId: number | undefined): void => {
    if (partId !== hoveredPartId) {
      hoveredPartId = partId;
      onPartHovered(partId);
    }
  };
  const readLatestMove = (): void => {
    const move: PointerEvent | undefined = latestMove;

    stopTimer();

    if (move) {
      const partId: number | undefined = renderer.getBurnPartIdAtPointer(getBurnScenePointer(canvas, move));
      const { left, top }: DOMRect = canvas.getBoundingClientRect();
      const isOnAxis: boolean = renderer.isBurnLiftAxisAtPoint({ xPx: move.clientX - left, yPx: move.clientY - top });

      reportHoveredPart(partId);

      // The lift drag listener owns the cursor over the arrow.
      if (!isOnAxis) {
        canvas.style.cursor = partId ? PART_CURSOR : DEFAULT_CURSOR;
      }
    }
  };
  const handlePointerMove = (pointerEvent: PointerEvent): void => {
    if (!isBurnSceneHoverMove(pointerEvent)) {
      stopTimer();

      return;
    }

    latestMove = pointerEvent;
    timerId ??= setTimeout(readLatestMove, BURN_SCENE_HOVER_MIN_INTERVAL_MS);
  };
  const handlePointerLeave = (): void => {
    stopTimer();
    reportHoveredPart(undefined);
    canvas.style.cursor = DEFAULT_CURSOR;
  };

  canvas.addEventListener(POINTER_MOVE_EVENT, handlePointerMove);
  canvas.addEventListener(POINTER_LEAVE_EVENT, handlePointerLeave);

  return () => {
    stopTimer();
    canvas.removeEventListener(POINTER_MOVE_EVENT, handlePointerMove);
    canvas.removeEventListener(POINTER_LEAVE_EVENT, handlePointerLeave);
  };
};
