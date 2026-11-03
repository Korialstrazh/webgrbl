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
import type { DataTexture, Group, LineBasicMaterial, LineSegments, MeshToonMaterial } from 'three';
import type { BurnSceneMesh } from './BurnSceneMesh';

export interface BurnSceneObjects {
  /** Holds every mesh; bed mm are scene units and Z is up. */
  group: Group;
  /** One per region of the model, in the same order. */
  meshes: BurnSceneMesh[];
  /** The material of every mesh that is not selected. */
  material: MeshToonMaterial;
  /** The material of the mesh of the selected part. */
  highlightMaterial: MeshToonMaterial;
  /** The brightness bands both materials use. */
  toonBands: DataTexture;
  /** The ink lines of the meshes, each a child of its mesh so that it rises with it. */
  outlines: LineSegments[];
  /** The material of every ink line. */
  outlineMaterial: LineBasicMaterial;
}
