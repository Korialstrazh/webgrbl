/**
 * Tells whether any outline point of the drawables lies outside a rectangle by more than a margin. The margin absorbs
 * the flattening error of curves that touch the edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
