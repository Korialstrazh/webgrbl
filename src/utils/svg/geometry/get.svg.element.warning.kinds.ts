/**
 * Gets the warnings one shown SVG element raises: text and images draw nothing, and a clip-path or mask is not applied
 * to the burn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import type { SvgWarningContext } from './interfaces/SvgWarningContext';
import { isSvgElementClipped } from './is.svg.element.clipped';
import { SVG_UNSUPPORTED_ELEMENT_KINDS, SVG_UNSUPPORTED_KIND } from './svg.shape.constants';
import type { SvgUnsupportedKind } from './svg.shape.constants';

export const getSvgElementWarningKinds = (
  element: Element,
  style: SvgResolvedStyle,
  context: SvgWarningContext,
): SvgUnsupportedKind[] => {
  const warningKinds: SvgUnsupportedKind[] = [];
  const unsupportedKind: SvgUnsupportedKind | undefined = SVG_UNSUPPORTED_ELEMENT_KINDS.get(element.localName);

  if (style.isVisible && unsupportedKind) {
    warningKinds.push(unsupportedKind);
  }

  if (context.hasClippingElements && isSvgElementClipped(element, context.rules)) {
    warningKinds.push(SVG_UNSUPPORTED_KIND.CLIPPED);
  }

  return warningKinds;
};
