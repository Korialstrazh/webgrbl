/**
 * Gets the distance from a point to the nearest point of a line segment.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from './interfaces/GeometryPoint';

export const getPointSegmentDistance = (point: GeometryPoint, start: GeometryPoint, end: GeometryPoint): number => {
  const segmentX: number = end.x - start.x;
  const segmentY: number = end.y - start.y;
  const squaredLength: number = segmentX * segmentX + segmentY * segmentY;
  const projection: number = squaredLength
    ? ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / squaredLength
    : 0;
  const clampedProjection: number = Math.min(1, Math.max(0, projection));
  const nearestX: number = start.x + clampedProjection * segmentX;
  const nearestY: number = start.y + clampedProjection * segmentY;

  return Math.hypot(point.x - nearestX, point.y - nearestY);
};
