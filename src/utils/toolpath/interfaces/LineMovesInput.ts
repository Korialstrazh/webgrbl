/**
 * What line mode needs to burn all passes of a layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { BedDrawable } from './BedDrawable';

export interface LineMovesInput {
  /** Every shape of the project in paint order. */
  drawables: BedDrawable[];
  /** The layer to burn. */
  layer: ProjectLayer;
  /** Where the head is before the layer starts. */
  startPoint: GeometryPoint;
}
