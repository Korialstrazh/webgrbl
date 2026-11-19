/**
 * Gets the visible fill and stroke of one drawn SVG element from its resolved style. A line has no fill, and a stroke
 * without width is not visible.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgPaintOfValue } from './get.svg.paint.of.value';
import type { SvgElementPaints } from './interfaces/SvgElementPaints';
import type { SvgPaintLookup } from './interfaces/SvgPaintLookup';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import { SVG_DRAWN_ELEMENT } from './svg.geometry.constants';

export const getSvgElementPaints = (
  element: Element,
  style: SvgResolvedStyle,
  paintLookup: SvgPaintLookup,
): SvgElementPaints => ({
  fill: element.localName === SVG_DRAWN_ELEMENT.LINE
    ? undefined
    : getSvgPaintOfValue(style.fill, style.opacity * style.fillOpacity * style.fillAlpha, paintLookup),
  stroke: style.strokeWidth > 0
    ? getSvgPaintOfValue(style.stroke, style.opacity * style.strokeOpacity * style.strokeAlpha, paintLookup)
    : undefined,
});
