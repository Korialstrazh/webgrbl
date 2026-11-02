/**
 * A quadratic Bezier path segment from the current point, in absolute coordinates.
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

export interface SvgPathQuadraticSegment {
  /** Always quadratic. */
  kind: typeof SVG_PATH_SEGMENT_KIND.QUADRATIC;
  /** The single control point. */
  control: GeometryPoint;
  /** The end point. */
  point: GeometryPoint;
}
