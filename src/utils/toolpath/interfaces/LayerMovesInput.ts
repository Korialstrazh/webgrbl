/**
 * What the toolpath needs to burn all passes of one layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { BedDrawable } from './BedDrawable';
import type { ToolpathPaintArea } from './ToolpathPaintArea';

export interface LayerMovesInput {
  /** The layer to burn. */
  layer: ProjectLayer;
  /** Every shape of the project in paint order, for line mode. */
  drawables: BedDrawable[];
  /** Every paint area of the project in paint order, for fill mode. */
  paintAreas: ToolpathPaintArea[];
  /** Where the head is before the layer starts. */
  startPoint: GeometryPoint;
}
