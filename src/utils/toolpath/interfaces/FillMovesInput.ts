/**
 * What fill mode needs to burn all passes of a layer.
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
import type { FillLine } from './FillLine';

export interface FillMovesInput {
  /** The lines of the layer from bottom to top. */
  fillLines: FillLine[];
  /** The layer to burn. */
  layer: ProjectLayer;
  /** Where the head is before the layer starts. */
  startPoint: GeometryPoint;
  /** Width of the machine work area in mm; the overscan is shortened so the head stays inside it. */
  workAreaXMm: number;
}
