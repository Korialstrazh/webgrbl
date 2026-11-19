/**
 * Hides every tooltip from now until the pointer moves away from where it rests, and returns the function that ends
 * the hold early. A view that changes under a still pointer would otherwise open the tooltip of whatever control
 * just appeared beneath it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { TOOLTIP_HOLD_ATTRIBUTE } from '../layout.constants';
import { POINTER_MOVE_EVENT_NAME } from './browser.events.constants';
import type { TooltipHoldRelease } from './interfaces/TooltipHoldRelease';

/** A pointer that moves less than this is taken as resting; browsers send moves of 0 px after a layout change. */
const POINTER_MOVE_THRESHOLD_PX = 4;

export const holdTooltipsUntilPointerMoves = (): TooltipHoldRelease => {
  let hasRestPoint: boolean = false;
  let restClientX: number = 0;
  let restClientY: number = 0;

  const releaseTooltips = (): void => {
    document.documentElement.removeAttribute(TOOLTIP_HOLD_ATTRIBUTE);
    window.removeEventListener(POINTER_MOVE_EVENT_NAME, releaseOnPointerMove);
  };

  function releaseOnPointerMove(pointerEvent: PointerEvent): void {
    if (!hasRestPoint) {
      hasRestPoint = true;
      restClientX = pointerEvent.clientX;
      restClientY = pointerEvent.clientY;

      return;
    }

    const movedPx: number = Math.hypot(pointerEvent.clientX - restClientX, pointerEvent.clientY - restClientY);

    if (movedPx >= POINTER_MOVE_THRESHOLD_PX) {
      releaseTooltips();
    }
  }

  document.documentElement.setAttribute(TOOLTIP_HOLD_ATTRIBUTE, '');
  window.addEventListener(POINTER_MOVE_EVENT_NAME, releaseOnPointerMove);

  return releaseTooltips;
};
