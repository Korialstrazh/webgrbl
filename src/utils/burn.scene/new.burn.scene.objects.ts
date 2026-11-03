/**
 * Builds the three.js objects of a burn model: one mesh per region, with bed mm as scene units and Z up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BufferAttribute, BufferGeometry, Color, Group, Mesh, MeshLambertMaterial } from 'three';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnRegionMesh } from '../burn.model/interfaces/BurnRegionMesh';
import {
  BURN_SCENE_ATTRIBUTE,
  BURN_SCENE_BURNT_COLOUR,
  BURN_SCENE_CLEAN_COLOUR,
  BURN_SCENE_COLOUR_VALUES_PER_VERTEX,
  BURN_SCENE_INDEX_VALUES_PER_ITEM,
  BURN_SCENE_POSITION_VALUES_PER_VERTEX,
} from './burn.scene.constants';
import type { BurnSceneMesh } from './interfaces/BurnSceneMesh';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';

const getVertexColours = (shades: Float32Array): Float32Array<ArrayBuffer> => {
  const cleanColour: Color = new Color(BURN_SCENE_CLEAN_COLOUR);
  const burntColour: Color = new Color(BURN_SCENE_BURNT_COLOUR);
  const vertexColours: Float32Array<ArrayBuffer> = new Float32Array(
    shades.length * BURN_SCENE_COLOUR_VALUES_PER_VERTEX,
  );
  const shadeColour: Color = new Color();

  for (const [vertex, shade] of shades.entries()) {
    shadeColour
      .lerpColors(cleanColour, burntColour, shade)
      .toArray(vertexColours, vertex * BURN_SCENE_COLOUR_VALUES_PER_VERTEX);
  }

  return vertexColours;
};

const newBurnRegionGeometry = ({ positions, shades, indices }: BurnRegionMesh): BufferGeometry => {
  const geometry: BufferGeometry = new BufferGeometry();

  geometry.setAttribute(
    BURN_SCENE_ATTRIBUTE.POSITION,
    new BufferAttribute(positions, BURN_SCENE_POSITION_VALUES_PER_VERTEX),
  );
  geometry.setAttribute(
    BURN_SCENE_ATTRIBUTE.COLOUR,
    new BufferAttribute(getVertexColours(shades), BURN_SCENE_COLOUR_VALUES_PER_VERTEX),
  );
  geometry.setIndex(new BufferAttribute(indices, BURN_SCENE_INDEX_VALUES_PER_ITEM));
  // The quads share no vertices, so each face gets its own flat normal.
  geometry.computeVertexNormals();

  return geometry;
};

export const newBurnSceneObjects = (model: BurnModel): BurnSceneObjects => {
  const group: Group = new Group();
  const material: MeshLambertMaterial = new MeshLambertMaterial({ vertexColors: true });
  const meshes: BurnSceneMesh[] = model.meshes.map((regionMesh: BurnRegionMesh): BurnSceneMesh => ({
    partId: regionMesh.partId,
    mesh: new Mesh(newBurnRegionGeometry(regionMesh), material),
  }));

  for (const { mesh } of meshes) {
    group.add(mesh);
  }

  return { group, meshes, material };
};
