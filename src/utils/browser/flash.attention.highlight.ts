/**
 * Draws a brief accent glow around a few elements, so a view that changed on its own (the Fix warnings button opening
 * the Toolpath view) shows the user where to look. A timer removes the mark once the glow has run, also where no
 * animation runs (reduced motion, tests).
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ATTENTION_HIGHLIGHT_ATTRIBUTE, ATTENTION_HIGHLIGHT_DURATION_MS } from './attention.highlight.constants';

export const flashAttentionHighlight = (elements: (Element | null | undefined)[]): void => {
  for (const element of elements) {
    if (element) {
      element.setAttribute(ATTENTION_HIGHLIGHT_ATTRIBUTE, '');
      window.setTimeout(() => element.removeAttribute(ATTENTION_HIGHLIGHT_ATTRIBUTE), ATTENTION_HIGHLIGHT_DURATION_MS);
    }
  }
};
