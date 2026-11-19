/**
 * The align of a popover that opens below its anchor, right-aligned to it, moved so it never covers the elements marked
 * to stay in sight (the Job steps and the next-step button). Measured each time the popover opens.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PopoverProps } from 'antd';
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import { getPopoverKeepClearShiftPx } from '../layout/get.popover.keep.clear.shift.px';
import type { PopoverShiftPx } from '../layout/interfaces/PopoverShiftPx';
import type { ScreenBox } from '../layout/interfaces/ScreenBox';
import { POPOVER_KEEP_CLEAR_SELECTOR } from '../layout.constants';

const getKeepClearBox = (): ScreenBox | undefined => {
  const boxes: DOMRect[] = [...document.querySelectorAll<HTMLElement>(POPOVER_KEEP_CLEAR_SELECTOR)]
    .map((element: HTMLElement): DOMRect => element.getBoundingClientRect())
    .filter((box: DOMRect): boolean => box.width > 0 && box.height > 0);

  if (boxes.length === 0) {
    return undefined;
  }

  return {
    left: Math.min(...boxes.map((box: DOMRect): number => box.left)),
    right: Math.max(...boxes.map((box: DOMRect): number => box.right)),
    top: Math.min(...boxes.map((box: DOMRect): number => box.top)),
    bottom: Math.max(...boxes.map((box: DOMRect): number => box.bottom)),
  };
};

export interface PopoverKeepClearAlign {
  align: PopoverProps['align'];
  isShifted: boolean;
}

export const usePopoverKeepClearAlign = (
  isOpen: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  popoverWidthPx: number,
): PopoverKeepClearAlign => {
  const [shiftPx, setShiftPx] = useState<PopoverShiftPx>({ leftPx: 0, downPx: 0 });

  useLayoutEffect(() => {
    const anchorElement: HTMLElement | null = anchorRef.current;

    if (isOpen && anchorElement) {
      setShiftPx(getPopoverKeepClearShiftPx(anchorElement.getBoundingClientRect(), getKeepClearBox(), popoverWidthPx));
    }
  }, [anchorRef, isOpen, popoverWidthPx]);

  // The target is moved, not the popover's own offset, so antd keeps its usual gap below the anchor.
  return {
    align: { targetOffset: [shiftPx.leftPx, -shiftPx.downPx] },
    isShifted: shiftPx.leftPx > 0 || shiftPx.downPx > 0,
  };
};
