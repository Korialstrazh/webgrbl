/**
 * How far a popover that opens below its anchor, right-aligned to it, must move so it never covers an area that has to
 * stay in sight (the Job steps and the next-step button): to the left of that area when the window has room for it,
 * otherwise down below it. Nothing moves when the area is absent or already clear of the popover.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PopoverShiftPx } from './interfaces/PopoverShiftPx';
import type { ScreenBox } from './interfaces/ScreenBox';

export const POPOVER_KEEP_CLEAR_GAP_PX = 8;

const NO_SHIFT: PopoverShiftPx = { leftPx: 0, downPx: 0 };

export const getPopoverKeepClearShiftPx = (
  anchorBox: ScreenBox,
  keepClearBox: ScreenBox | undefined,
  popoverWidthPx: number,
): PopoverShiftPx => {
  if (!keepClearBox) {
    return NO_SHIFT;
  }

  const popoverLeftPx: number = anchorBox.right - popoverWidthPx;
  const isAlreadyClear: boolean = popoverLeftPx >= keepClearBox.right || anchorBox.right <= keepClearBox.left;

  if (isAlreadyClear) {
    return NO_SHIFT;
  }

  const shiftedRightPx: number = keepClearBox.left - POPOVER_KEEP_CLEAR_GAP_PX;

  if (shiftedRightPx - popoverWidthPx >= POPOVER_KEEP_CLEAR_GAP_PX) {
    return { leftPx: anchorBox.right - shiftedRightPx, downPx: 0 };
  }

  return { leftPx: 0, downPx: Math.max(0, keepClearBox.bottom + POPOVER_KEEP_CLEAR_GAP_PX - anchorBox.bottom) };
};
