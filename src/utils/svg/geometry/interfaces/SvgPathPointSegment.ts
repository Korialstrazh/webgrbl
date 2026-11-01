/**
 * A path segment that only needs an end point: a move or a straight line, in absolute coordinates.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from './GeometryPoint';
import type { SVG_PATH_SEGMENT_KIND } from '../svg.path.constants';

export interface SvgPathPointSegment {
  /** Move starts a new subpath; line draws a straight line from the current point. */
  kind: typeof SVG_PATH_SEGMENT_KIND.MOVE | typeof SVG_PATH_SEGMENT_KIND.LINE;
  /** The end point. */
  point: GeometryPoint;
}
