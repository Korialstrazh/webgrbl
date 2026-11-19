/**
 * An elliptical arc described by its centre, radii, axis turn and angles, as needed to draw it (the SVG path gives
 * only its end points).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from './GeometryPoint';

export interface SvgArcCentreForm {
  /** Centre of the ellipse. */
  centre: GeometryPoint;
  /** Radius along the ellipse's own x axis, after scaling up radii too small to reach the end point. */
  radiusX: number;
  /** Radius along the ellipse's own y axis, after the same scaling. */
  radiusY: number;
  /** Cosine of the turn of the ellipse's x axis. */
  axisCosine: number;
  /** Sine of the turn of the ellipse's x axis. */
  axisSine: number;
  /** Angle on the ellipse where the arc starts, in radians. */
  startAngle: number;
  /** Signed angle the arc covers, in radians; positive in the direction of growing angle. */
  sweepAngle: number;
}
