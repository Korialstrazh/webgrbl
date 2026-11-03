/**
 * One flat four-cornered face of a burn mesh.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnMeshQuad {
  /** Index of the mesh the face belongs to. */
  meshIndex: number;
  /** Three values per corner, x, y and height, counterclockwise when seen from outside. */
  corners: number[];
  /** How burnt the face looks, from 0 to 1. */
  shade: number;
}
