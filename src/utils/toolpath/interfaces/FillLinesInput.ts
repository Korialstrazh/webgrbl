/**
 * What the fill rasteriser needs to find the lines of one layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { ToolpathPaintArea } from './ToolpathPaintArea';

export interface FillLinesInput {
  /** Every paint area of the project in paint order, back to front. */
  paintAreas: ToolpathPaintArea[];
  /** The fill layer to rasterise. */
  layer: ProjectLayer;
}
