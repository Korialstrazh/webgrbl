/**
 * A vertex of a stroke with its neighbours, where a round join is drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';

export interface StrokeJoinCorner {
  /** The point before the vertex. */
  previous: GeometryPoint;
  /** The vertex the join is drawn around. */
  vertex: GeometryPoint;
  /** The point after the vertex. */
  next: GeometryPoint;
}
