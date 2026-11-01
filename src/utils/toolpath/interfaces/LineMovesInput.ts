/**
 * What line mode needs to burn one pass of a layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDrawable } from './BedDrawable';
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';

export interface LineMovesInput {
  /** Every shape of the project in paint order. */
  drawables: BedDrawable[];
  /** The layer to burn. */
  layer: ProjectLayer;
  /** Where the head is before the pass. */
  startPoint: GeometryPoint;
}
