/**
 * Gets the warnings one shown SVG element raises: text and images draw nothing, and a clip-path or mask is not applied
 * to the burn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
