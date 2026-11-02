/**
 * An elliptical arc path segment from the current point, with its end point in absolute coordinates.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SVG_PATH_SEGMENT_KIND } from '../svg.path.constants';
import type { GeometryPoint } from './GeometryPoint';

export interface SvgPathArcSegment {
  /** Always arc. */
  kind: typeof SVG_PATH_SEGMENT_KIND.ARC;
  /** Radius along the ellipse's own x axis, as written; it is scaled up when too small to reach the end. */
  radiusX: number;
  /** Radius along the ellipse's own y axis, as written; it is scaled up when too small to reach the end. */
  radiusY: number;
  /** Turn of the ellipse's x axis from the frame's x axis, in degrees. */
  rotationDeg: number;
  /** True to take the arc longer than half the ellipse. */
  isLargeArc: boolean;
  /** True to go in the direction of growing angle (clockwise on a Y-down screen). */
  isSweep: boolean;
  /** The end point. */
  point: GeometryPoint;
}
