/**
 * Tells whether a scrollable element shows its bottom, within one rem of it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getRootFontSizePixels } from '../../utils/browser/get.root.font.size.pixels';

const BOTTOM_THRESHOLD_REM = 1;

export const isConsoleScrolledToBottom = (scrollElement: HTMLElement): boolean => {
  const { scrollHeight, scrollTop, clientHeight } = scrollElement;
  const distanceFromBottomPixels: number = scrollHeight - scrollTop - clientHeight;

  return distanceFromBottomPixels <= BOTTOM_THRESHOLD_REM * getRootFontSizePixels();
};
