/**
 * Reads the root font size in pixels, the value one rem stands for.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

const DEFAULT_ROOT_FONT_SIZE_PIXELS = 16;

export const getRootFontSizePixels = (): number =>
  parseFloat(window.getComputedStyle(document.documentElement).fontSize) || DEFAULT_ROOT_FONT_SIZE_PIXELS;
