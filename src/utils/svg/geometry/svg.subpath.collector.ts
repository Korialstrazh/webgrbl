import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgSubpath } from './interfaces/SvgSubpath';
import { SVG_POINT_EPSILON, SVG_SUBPATH_MIN_POINTS } from './svg.path.constants';

const isSamePoint = (point: GeometryPoint, otherPoint: GeometryPoint): boolean =>
  Math.abs(point.x - otherPoint.x) <= SVG_POINT_EPSILON && Math.abs(point.y - otherPoint.y) <= SVG_POINT_EPSILON;

/** True when the point is not a repeat of the last collected point. */
const isNewPoint = (lastPoint: GeometryPoint | undefined, point: GeometryPoint): boolean =>
  !lastPoint || !isSamePoint(lastPoint, point);

/** True when the points end where they start, as an explicit line back before a close does. */
const hasRepeatedFirstPoint = (points: GeometryPoint[]): boolean => {
  const firstPoint: GeometryPoint | undefined = points[0];
  const lastPoint: GeometryPoint | undefined = points.at(-1);

  return points.length > 1 && Boolean(firstPoint && lastPoint && isSamePoint(firstPoint, lastPoint));
};

/**
 * Collects flattened points into subpaths: it drops repeated points, leaves out the repeated first point of a closed
 * subpath and drops subpaths with fewer than two points.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class SvgSubpathCollector {
  // The finished subpaths in drawing order.
  private readonly subpaths: SvgSubpath[] = [];

  // The points of the subpath being drawn.
  private points: GeometryPoint[] = [];

  public startSubpath(point: GeometryPoint): void {
    this.finishSubpath(false);
    this.points = [point];
  }

  public addPoints(points: GeometryPoint[]): void {
    for (const point of points) {
      if (isNewPoint(this.points.at(-1), point)) {
        this.points.push(point);
      }
    }
  }

  public finishSubpath(isClosed: boolean): void {
    const points: GeometryPoint[] = isClosed && hasRepeatedFirstPoint(this.points)
      ? this.points.slice(0, -1)
      : this.points;

    if (points.length >= SVG_SUBPATH_MIN_POINTS) {
      this.subpaths.push({ points, isClosed });
    }

    this.points = [];
  }

  public getSubpaths(): SvgSubpath[] {
    this.finishSubpath(false);

    return this.subpaths;
  }
}
