/**
 * How to turn a dose grid into meshes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
