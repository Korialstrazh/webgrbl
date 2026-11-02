/**
 * A vertex of a stroke with its neighbours, where a round join is drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
