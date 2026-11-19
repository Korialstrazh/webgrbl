/**
 * A cubic Bezier curve given by its start, its two control points and its end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
