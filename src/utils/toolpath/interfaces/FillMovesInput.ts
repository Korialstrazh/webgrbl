/**
 * What fill mode needs to burn all passes of a layer.
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
import type { FillLine } from './FillLine';

export interface FillMovesInput {
  /** The lines of the layer from bottom to top. */
  fillLines: FillLine[];
  /** The layer to burn. */
  layer: ProjectLayer;
  /** Where the head is before the layer starts. */
  startPoint: GeometryPoint;
}
