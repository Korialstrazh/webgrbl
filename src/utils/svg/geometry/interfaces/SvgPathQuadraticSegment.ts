/**
 * A quadratic Bezier path segment from the current point, in absolute coordinates.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SVG_PATH_SEGMENT_KIND } from '../svg.path.constants';
import type { GeometryPoint } from './GeometryPoint';

export interface SvgPathQuadraticSegment {
  /** Always quadratic. */
  kind: typeof SVG_PATH_SEGMENT_KIND.QUADRATIC;
  /** The single control point. */
  control: GeometryPoint;
  /** The end point. */
  point: GeometryPoint;
}
