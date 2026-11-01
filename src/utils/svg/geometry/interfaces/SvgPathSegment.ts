/**
 * Any segment of SVG path data after reading, in absolute coordinates.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
