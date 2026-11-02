/**
 * Gets where a point in gradient coordinates lies along a gradient, from 0 at its start to 1 at its end, not yet
 * padded. The caller maps the bed point into gradient coordinates first, through the inverse of the gradient matrix, so
 * the gradient numbers apply as written whatever its units, element transforms, object placement or gradientTransform.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgGreyGradient } from '../svg/geometry/interfaces/SvgGreyGradient';
import type { SvgLinearGradient } from '../svg/geometry/interfaces/SvgLinearGradient';
import type { SvgRadialGradient } from '../svg/geometry/interfaces/SvgRadialGradient';
import { SVG_GRADIENT_KIND } from '../svg/geometry/svg.geometry.constants';

/** The offset of a gradient whose start and end coincide: SVG paints it with the last stop. */
const COLLAPSED_GRADIENT_OFFSET = 1;

const getLinearOffset = (gradient: SvgLinearGradient, gradientPoint: GeometryPoint): number => {
  const directionX: number = gradient.x2 - gradient.x1;
  const directionY: number = gradient.y2 - gradient.y1;
  const lengthSquared: number = directionX * directionX + directionY * directionY;

  if (!lengthSquared) {
    return COLLAPSED_GRADIENT_OFFSET;
  }

  return ((gradientPoint.x - gradient.x1) * directionX + (gradientPoint.y - gradient.y1) * directionY) / lengthSquared;
};

const getRadialOffset = (gradient: SvgRadialGradient, gradientPoint: GeometryPoint): number => {
  if (gradient.r <= 0) {
    return COLLAPSED_GRADIENT_OFFSET;
  }

  return Math.hypot(gradientPoint.x - gradient.cx, gradientPoint.y - gradient.cy) / gradient.r;
};

export const getGradientOffset = (gradient: SvgGreyGradient, gradientPoint: GeometryPoint): number =>
  (gradient.kind === SVG_GRADIENT_KIND.RADIAL
    ? getRadialOffset(gradient, gradientPoint)
    : getLinearOffset(gradient, gradientPoint));
