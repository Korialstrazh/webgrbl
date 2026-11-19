/**
 * Gets the lightness of a grey gradient paint at a point, composited over white with the paint and stop opacity. Beyond
 * its ends the gradient keeps its end colours (SVG spreadMethod pad).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getColourLightness } from '../layers/get.colour.lightness';
import { getSvgMatrixPoint } from '../svg/geometry/get.svg.matrix.point';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgGradientStop } from '../svg/geometry/interfaces/SvgGradientStop';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import { getGradientOffset } from './get.gradient.offset';
import { getPaintLightness } from './get.paint.lightness';
import type { GradientLightnessStop } from './interfaces/GradientLightnessStop';
import type { GradientLightnessValue } from './interfaces/GradientLightnessValue';
import { WHITE_LIGHTNESS } from './toolpath.constants';

const STOPS_CACHE: WeakMap<SvgGradientStop[], GradientLightnessStop[]> = new WeakMap();

const getLightnessStops = (stops: SvgGradientStop[]): GradientLightnessStop[] => {
  const cachedStops: GradientLightnessStop[] | undefined = STOPS_CACHE.get(stops);

  if (cachedStops) {
    return cachedStops;
  }

  const lightnessStops: GradientLightnessStop[] = [];
  let previousOffset = 0;

  for (const stop of stops) {
    previousOffset = Math.max(previousOffset, stop.offset);
    lightnessStops.push({ offset: previousOffset, lightness: getColourLightness(stop.colour), opacity: stop.opacity });
  }

  STOPS_CACHE.set(stops, lightnessStops);

  return lightnessStops;
};

const getMixedValue = (startValue: number, endValue: number, fraction: number): number =>
  startValue + (endValue - startValue) * fraction;

/** The colour lightness and opacity at an offset, mixed between the two stops around it. */
const getStopAt = (stops: GradientLightnessStop[], offset: number): GradientLightnessValue => {
  const nextIndex: number = stops.findIndex((stop: GradientLightnessStop): boolean => stop.offset > offset);
  const nextStop: GradientLightnessStop | undefined = stops[nextIndex];
  const previousStop: GradientLightnessStop | undefined = stops[nextIndex - 1];

  if (!nextStop || !previousStop) {
    return nextStop ?? stops.at(-1) ?? { lightness: WHITE_LIGHTNESS, opacity: 0 };
  }

  const fraction: number = (offset - previousStop.offset) / (nextStop.offset - previousStop.offset);

  return {
    lightness: getMixedValue(previousStop.lightness, nextStop.lightness, fraction),
    opacity: getMixedValue(previousStop.opacity, nextStop.opacity, fraction),
  };
};

export const getGradientLightness = (
  paint: SvgPaint,
  bedToGradientMatrix: SvgMatrix | undefined,
  point: GeometryPoint,
): number => {
  if (!paint.gradient || !bedToGradientMatrix) {
    return getPaintLightness(paint.colour, paint.opacity);
  }

  const gradientOffset: number = getGradientOffset(paint.gradient, getSvgMatrixPoint(bedToGradientMatrix, point));
  const offset: number = Math.min(1, Math.max(0, gradientOffset));
  const { lightness, opacity } = getStopAt(getLightnessStops(paint.gradient.stops), offset);

  return WHITE_LIGHTNESS - paint.opacity * opacity * (WHITE_LIGHTNESS - lightness);
};
