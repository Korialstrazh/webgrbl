/**
 * What fill mode needs to burn one pass of a layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { FillLine } from './FillLine';
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';

export interface FillMovesInput {
  /** The lines of the layer from bottom to top. */
  fillLines: FillLine[];
  /** The layer to burn. */
  layer: ProjectLayer;
  /** Where the head is before the pass. */
  startPoint: GeometryPoint;
}
