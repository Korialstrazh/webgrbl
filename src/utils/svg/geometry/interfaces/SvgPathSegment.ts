/**
 * Any segment of SVG path data after reading, in absolute coordinates.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgPathArcSegment } from './SvgPathArcSegment';
import type { SvgPathCloseSegment } from './SvgPathCloseSegment';
import type { SvgPathCubicSegment } from './SvgPathCubicSegment';
import type { SvgPathPointSegment } from './SvgPathPointSegment';
import type { SvgPathQuadraticSegment } from './SvgPathQuadraticSegment';

export type SvgPathSegment =
  | SvgPathPointSegment
  | SvgPathCubicSegment
  | SvgPathQuadraticSegment
  | SvgPathArcSegment
  | SvgPathCloseSegment;
