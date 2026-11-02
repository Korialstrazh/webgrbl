/**
 * A cubic Bezier curve given by its start, its two control points and its end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from './GeometryPoint';

export interface SvgCubicCurve {
  /** Where the curve starts. */
  start: GeometryPoint;
  /** Control point that sets the direction at the start. */
  control1: GeometryPoint;
  /** Control point that sets the direction at the end. */
  control2: GeometryPoint;
  /** Where the curve ends. */
  end: GeometryPoint;
}
