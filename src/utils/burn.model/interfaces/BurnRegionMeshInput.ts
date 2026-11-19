/**
 * How to turn a dose grid into meshes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnDepthBasis } from './BurnDepthBasis';

export interface BurnRegionMeshInput {
  /** Thickness of the sheet in mm. */
  thicknessMm: number;
  /** What the depth estimate is based on. */
  basis: BurnDepthBasis;
  /** Most triangles all meshes together may have; BURN_MESH_MAX_TRIANGLES when left out. */
  maxTriangleCount?: number;
}
