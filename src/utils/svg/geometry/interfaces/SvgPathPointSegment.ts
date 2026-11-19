/**
 * A path segment that only needs an end point: a move or a straight line, in absolute coordinates.
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

export interface SvgPathPointSegment {
  /** Move starts a new subpath; line draws a straight line from the current point. */
  kind: typeof SVG_PATH_SEGMENT_KIND.MOVE | typeof SVG_PATH_SEGMENT_KIND.LINE;
  /** The end point. */
  point: GeometryPoint;
}
