/**
 * One mesh of the 3D preview and the part it lifts with.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BufferGeometry, Material, Mesh } from 'three';

export interface BurnSceneMesh {
  /** The part the mesh lifts with; undefined for the sheet. */
  partId: number | undefined;
  /** The mesh itself. */
  mesh: Mesh<BufferGeometry, Material>;
}
