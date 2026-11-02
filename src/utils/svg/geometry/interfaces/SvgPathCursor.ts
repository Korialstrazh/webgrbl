/**
 * Where reading SVG path data stands after a segment: the current point, the start of the current subpath and the
 * control point a smooth curve would reflect.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from './GeometryPoint';

export interface SvgPathCursor {
  /** The end of the last segment. */
  current: GeometryPoint;
  /** The point a close segment returns to. */
  subpathStart: GeometryPoint;
  /** The second control point of the last segment when it was a cubic, otherwise undefined. */
  lastCubicControl: GeometryPoint | undefined;
  /** The control point of the last segment when it was a quadratic, otherwise undefined. */
  lastQuadraticControl: GeometryPoint | undefined;
}
