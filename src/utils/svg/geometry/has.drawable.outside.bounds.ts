/**
 * Tells whether any outline point of the drawables lies outside a rectangle by more than a margin. The margin absorbs
 * the flattening error of curves that touch the edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgViewportBounds } from '../interfaces/SvgViewportBounds';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgDrawable } from './interfaces/SvgDrawable';
import type { SvgSubpath } from './interfaces/SvgSubpath';

const isPointOutsideBounds = (point: GeometryPoint, bounds: SvgViewportBounds, margin: number): boolean =>
  point.x < bounds.minX - margin
  || point.y < bounds.minY - margin
  || point.x > bounds.minX + bounds.width + margin
  || point.y > bounds.minY + bounds.height + margin;

export const hasDrawableOutsideBounds = (
  drawables: SvgDrawable[],
  bounds: SvgViewportBounds,
  margin: number,
): boolean => drawables.some((drawable: SvgDrawable): boolean => drawable.subpaths.some(
  (subpath: SvgSubpath): boolean => subpath.points.some(
    (point: GeometryPoint): boolean => isPointOutsideBounds(point, bounds, margin),
  ),
));
