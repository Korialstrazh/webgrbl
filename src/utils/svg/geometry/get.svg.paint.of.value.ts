/**
 * Turns a resolved fill or stroke value and its combined opacity into a paint: a colour, or a gradient read from the
 * document. None, an opacity that rounds to 0 and a reference to a missing gradient give undefined.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgGradient } from './get.svg.gradient';
import type { SvgGreyGradient } from './interfaces/SvgGreyGradient';
import type { SvgPaint } from './interfaces/SvgPaint';
import type { SvgPaintLookup } from './interfaces/SvgPaintLookup';
import {
  SVG_DEFAULT_STOP_COLOUR,
  SVG_OPACITY_ROUNDING_FACTOR,
  SVG_PAINT_NONE,
  SVG_PAINT_URL_PATTERN,
} from './svg.geometry.constants';

const getRoundedOpacity = (opacity: number): number =>
  Math.round(opacity * SVG_OPACITY_ROUNDING_FACTOR) / SVG_OPACITY_ROUNDING_FACTOR;

export const getSvgPaintOfValue = (
  paintValue: string,
  paintOpacity: number,
  paintLookup: SvgPaintLookup,
): SvgPaint | undefined => {
  const roundedOpacity: number = getRoundedOpacity(paintOpacity);

  if (paintValue === SVG_PAINT_NONE || roundedOpacity <= 0) {
    return undefined;
  }

  if (!SVG_PAINT_URL_PATTERN.test(paintValue)) {
    return { colour: paintValue, opacity: roundedOpacity, gradient: undefined };
  }

  const gradient: SvgGreyGradient | undefined = getSvgGradient(
    paintValue,
    paintLookup.elementsById,
    paintLookup.resolvedStyles,
  );

  if (!gradient) {
    return undefined;
  }

  return { colour: gradient.stops[0]?.colour ?? SVG_DEFAULT_STOP_COLOUR, opacity: roundedOpacity, gradient };
};
