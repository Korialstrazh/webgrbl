/**
 * What deciding the warnings of one SVG element needs: the style rules, and whether the document can clip at all.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgCssRule } from './SvgCssRule';

export interface SvgWarningContext {
  /** The style element rules of the document. */
  rules: SvgCssRule[];
  /** True when the document has a clipPath or mask element, so a clip-path or mask can have an effect. */
  hasClippingElements: boolean;
}
