/**
 * Gets the edges of filled subpaths as a flat list of x0, y0, x1, y1 groups. Every subpath is closed, as a fill closes
 * it, and horizontal edges are left out because a scanline never crosses them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';

export const getPolygonEdges = (subpaths: SvgSubpath[]): Float64Array => {
  const edgeValues: number[] = [];

  for (const { points } of subpaths) {
    for (const [pointIndex, start] of points.entries()) {
      const end: GeometryPoint | undefined = points[(pointIndex + 1) % points.length];

      if (end && end.y !== start.y) {
        edgeValues.push(start.x, start.y, end.x, end.y);
      }
    }
  }

  return Float64Array.from(edgeValues);
};
