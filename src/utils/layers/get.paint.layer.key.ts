/**
 * Gives the key of the layer a paint belongs to: grey paints and all-grey gradients go to shading, a gradient with
 * a colour stop goes to its first stop colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isGreyColour } from './is.grey.colour';
import { SHADING_LAYER_COLOUR } from './layer.constants';
import type { SvgGradientStop } from '../svg/geometry/interfaces/SvgGradientStop';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';

const isGreyStop = (stop: SvgGradientStop): boolean => isGreyColour(stop.colour);

export const getPaintLayerKey = (paint: SvgPaint): string => {
  const isGreyPaint: boolean = paint.gradient ? paint.gradient.stops.every(isGreyStop) : isGreyColour(paint.colour);

  return isGreyPaint ? SHADING_LAYER_COLOUR : paint.colour;
};
