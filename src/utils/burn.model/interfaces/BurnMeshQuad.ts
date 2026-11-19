/**
 * One flat four-cornered face of a burn mesh.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnMeshQuad {
  /** Index of the mesh the face belongs to. */
  meshIndex: number;
  /** Three values per corner, x, y and height, counterclockwise when seen from outside. */
  corners: number[];
  /** How burnt the face looks, from 0 to 1. */
  shade: number;
}
