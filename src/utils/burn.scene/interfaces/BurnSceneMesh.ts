/**
 * One mesh of the 3D preview and the part it lifts with.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BufferGeometry, Material, Mesh } from 'three';

export interface BurnSceneMesh {
  /** The part the mesh lifts with; undefined for the sheet. */
  partId: number | undefined;
  /** The mesh itself. */
  mesh: Mesh<BufferGeometry, Material>;
}
