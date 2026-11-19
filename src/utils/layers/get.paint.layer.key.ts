/**
 * Gives the key of the layer a paint belongs to: grey paints and all-grey gradients go to shading, a gradient with
 * a colour stop goes to its first stop colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isGreyColour } from './is.grey.colour';
import { SHADING_LAYER_COLOUR } from './layer.constants';
import type { SvgGradientStop } from '../svg/geometry/interfaces/SvgGradientStop';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';

const getFirstColourStop = (stops: SvgGradientStop[]): SvgGradientStop | undefined =>
  stops.find((stop: SvgGradientStop): boolean => !isGreyColour(stop.colour));

export const getPaintLayerKey = (paint: SvgPaint): string => {
  const colourStop: SvgGradientStop | undefined = paint.gradient ? getFirstColourStop(paint.gradient.stops) : undefined;

  if (colourStop) {
    return colourStop.colour;
  }

  return isGreyColour(paint.colour) ? SHADING_LAYER_COLOUR : paint.colour;
};
