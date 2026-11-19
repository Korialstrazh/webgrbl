/**
 * Reads the root font size in pixels, the value one rem stands for.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

const DEFAULT_ROOT_FONT_SIZE_PIXELS = 16;

export const getRootFontSizePixels = (): number =>
  parseFloat(window.getComputedStyle(document.documentElement).fontSize) || DEFAULT_ROOT_FONT_SIZE_PIXELS;
