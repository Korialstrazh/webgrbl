/**
 * The three.js objects of one burn model, with what must be freed when the model goes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Group, MeshLambertMaterial } from 'three';
import type { BurnSceneMesh } from './BurnSceneMesh';

export interface BurnSceneObjects {
  /** Holds every mesh; bed mm are scene units and Z is up. */
  group: Group;
  /** One per region of the model, in the same order. */
  meshes: BurnSceneMesh[];
  /** The material of every mesh that is not selected. */
  material: MeshLambertMaterial;
  /** The material of the mesh of the selected part. */
  highlightMaterial: MeshLambertMaterial;
}
