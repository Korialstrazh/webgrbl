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
import type { SvgPaint } from '../../svg/geometry/interfaces/SvgPaint';

export interface ToolpathPaintArea {
  /** The outline edges in bed mm, sorted into horizontal bands; horizontal edges are left out. */
  edgeIndex: ToolpathEdgeIndex;
  /** The box around the area, stroke width included. */
  bounds: ToolpathBounds;
  /** The box around the shape geometry, which gradients are spread over. */
  shapeBounds: ToolpathBounds;
  /** The paint of the area. */
  paint: SvgPaint;
  /** Key of the layer the paint belongs to. */
  layerKey: string;
}
