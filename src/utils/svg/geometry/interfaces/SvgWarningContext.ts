/**
 * What deciding the warnings of one SVG element needs: the style rules, and whether the document can clip at all.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgCssRule } from './SvgCssRule';

export interface SvgWarningContext {
  /** The style element rules of the document. */
  rules: SvgCssRule[];
  /** True when the document has a clipPath or mask element, so a clip-path or mask can have an effect. */
  hasClippingElements: boolean;
}
