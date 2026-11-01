/**
 * A filled area of the artwork, ready for scanline rasterising (turning it into horizontal lines).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathBounds } from './ToolpathBounds';
import type { ToolpathEdgeIndex } from './ToolpathEdgeIndex';
import type { SvgMatrix } from '../../svg/geometry/interfaces/SvgMatrix';
import type { SvgPaint } from '../../svg/geometry/interfaces/SvgPaint';
import type { SvgFillRule } from '../../svg/geometry/svg.geometry.constants';

export interface ToolpathPaintArea {
  /** The outline edges in bed mm, sorted into horizontal bands; horizontal edges are left out. */
  edgeIndex: ToolpathEdgeIndex;
  /** The box around the area, stroke width included. */
  bounds: ToolpathBounds;
  /** Maps a bed point into the coordinates of the paint gradient; undefined without a gradient that can be placed. */
  gradientMatrix: SvgMatrix | undefined;
  /** Which points are inside where the outline overlaps itself; strokes are always nonzero. */
  fillRule: SvgFillRule;
  /** The paint of the area. */
  paint: SvgPaint;
  /** Key of the layer the paint belongs to. */
  layerKey: string;
}
