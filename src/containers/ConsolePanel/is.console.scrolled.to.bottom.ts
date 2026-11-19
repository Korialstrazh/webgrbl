/**
 * Tells whether a scrollable element shows its bottom, within one rem of it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getRootFontSizePixels } from '../../utils/browser/get.root.font.size.pixels';

const BOTTOM_THRESHOLD_REM = 1;

export const isConsoleScrolledToBottom = (scrollElement: HTMLElement): boolean => {
  const { scrollHeight, scrollTop, clientHeight } = scrollElement;
  const distanceFromBottomPixels: number = scrollHeight - scrollTop - clientHeight;

  return distanceFromBottomPixels <= BOTTOM_THRESHOLD_REM * getRootFontSizePixels();
};
