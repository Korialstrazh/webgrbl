/**
 * Gets where a point lies along a gradient, from 0 at its start to 1 at its end, not yet padded.
 *
 * Gradient geometry is still in the SVG user space of the element, and the bed drawable does not carry the matrix to
 * it. So the gradient is placed on the box of the shape in bed mm: object-box fractions are taken of that box, with the
 * vertical fraction counted from the top as in SVG. This is exact for an object that is not rotated. A user-space
 * gradient keeps only its direction and is spread from one side of the box to the other; a user-space radial gradient
 * is centred on the box with half its size as radius.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathBounds } from './interfaces/ToolpathBounds';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgGreyGradient } from '../svg/geometry/interfaces/SvgGreyGradient';
import type { SvgLinearGradient } from '../svg/geometry/interfaces/SvgLinearGradient';
import type { SvgRadialGradient } from '../svg/geometry/interfaces/SvgRadialGradient';
import {
  SVG_GRADIENT_DEFAULT_CENTRE,
  SVG_GRADIENT_DEFAULT_RADIUS,
  SVG_GRADIENT_KIND,
  SVG_GRADIENT_UNITS,
} from '../svg/geometry/svg.geometry.constants';

/** The offset of a gradient whose start and end coincide: SVG paints it with the last stop. */
const COLLAPSED_GRADIENT_OFFSET = 1;

/** How far the value lies from the start towards the end, as a fraction; 0 for a box without size. */
const getBoxFraction = (start: number, end: number, value: number): number =>
  (start !== end ? (value - start) / (end - start) : 0);

/** The point as fractions of the shape box, x from the left and y from the top. */
const getShapeBoxPoint = (shapeBounds: ToolpathBounds, point: GeometryPoint): GeometryPoint => ({
  x: getBoxFraction(shapeBounds.minX, shapeBounds.maxX, point.x),
  y: getBoxFraction(shapeBounds.maxY, shapeBounds.minY, point.y),
});

const getBoxLinearOffset = (gradient: SvgLinearGradient, boxPoint: GeometryPoint): number => {
  const directionX: number = gradient.x2 - gradient.x1;
  const directionY: number = gradient.y2 - gradient.y1;
  const lengthSquared: number = directionX * directionX + directionY * directionY;

  if (!lengthSquared) {
    return COLLAPSED_GRADIENT_OFFSET;
  }

  return ((boxPoint.x - gradient.x1) * directionX + (boxPoint.y - gradient.y1) * directionY) / lengthSquared;
};

/** Box fractions count y from the top like SVG user space, so the user-space direction applies unchanged. */
const getUserSpaceLinearOffset = (gradient: SvgLinearGradient, boxPoint: GeometryPoint): number => {
  const directionX: number = gradient.x2 - gradient.x1;
  const directionY: number = gradient.y2 - gradient.y1;
  const startProjection: number = Math.min(0, directionX) + Math.min(0, directionY);
  const endProjection: number = Math.max(0, directionX) + Math.max(0, directionY);

  if (endProjection <= startProjection) {
    return COLLAPSED_GRADIENT_OFFSET;
  }

  return (boxPoint.x * directionX + boxPoint.y * directionY - startProjection) / (endProjection - startProjection);
};

const getRadialOffset = (gradient: SvgRadialGradient, boxPoint: GeometryPoint): number => {
  const isBoxGradient: boolean = gradient.units === SVG_GRADIENT_UNITS.OBJECT_BOUNDING_BOX;
  const centreX: number = isBoxGradient ? gradient.cx : SVG_GRADIENT_DEFAULT_CENTRE;
  const centreY: number = isBoxGradient ? gradient.cy : SVG_GRADIENT_DEFAULT_CENTRE;
  const radius: number = isBoxGradient ? gradient.r : SVG_GRADIENT_DEFAULT_RADIUS;

  if (radius <= 0) {
    return COLLAPSED_GRADIENT_OFFSET;
  }

  return Math.hypot(boxPoint.x - centreX, boxPoint.y - centreY) / radius;
};

export const getGradientOffset = (
  gradient: SvgGreyGradient,
  shapeBounds: ToolpathBounds,
  point: GeometryPoint,
): number => {
  const boxPoint: GeometryPoint = getShapeBoxPoint(shapeBounds, point);

  if (gradient.kind === SVG_GRADIENT_KIND.RADIAL) {
    return getRadialOffset(gradient, boxPoint);
  }

  return gradient.units === SVG_GRADIENT_UNITS.OBJECT_BOUNDING_BOX
    ? getBoxLinearOffset(gradient, boxPoint)
    : getUserSpaceLinearOffset(gradient, boxPoint);
};
