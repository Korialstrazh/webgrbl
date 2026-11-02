/**
 * What is needed to turn one painted outline into a paint area.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgMatrix } from '../../svg/geometry/interfaces/SvgMatrix';
import type { SvgPaint } from '../../svg/geometry/interfaces/SvgPaint';
import type { SvgSubpath } from '../../svg/geometry/interfaces/SvgSubpath';
import type { SvgFillRule } from '../../svg/geometry/svg.geometry.constants';

export interface PaintAreaInput {
  /** The outline in bed mm; every subpath is closed when filled. */
  subpaths: SvgSubpath[];
  /** The paint of the area. */
  paint: SvgPaint;
  /** Maps gradient coordinates to bed mm; undefined without a gradient that can be placed. */
  gradientMatrix: SvgMatrix | undefined;
  /** Which points are inside where the outline overlaps itself. */
  fillRule: SvgFillRule;
}
