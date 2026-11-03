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
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshToonMaterial,
  NearestFilter,
  RedFormat,
} from 'three';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnRegionMesh } from '../burn.model/interfaces/BurnRegionMesh';
import {
  BURN_SCENE_ATTRIBUTE,
  BURN_SCENE_BURNT_COLOUR,
  BURN_SCENE_CLEAN_COLOUR,
  BURN_SCENE_COLOUR_VALUES_PER_VERTEX,
  BURN_SCENE_HIGHLIGHT_COLOUR,
  BURN_SCENE_HIGHLIGHT_INTENSITY,
  BURN_SCENE_HOVER_INTENSITY,
  BURN_SCENE_INDEX_VALUES_PER_ITEM,
  BURN_SCENE_OUTLINE_COLOUR,
  BURN_SCENE_POSITION_VALUES_PER_VERTEX,
  BURN_SCENE_TOON_BANDS,
} from './burn.scene.constants';
import { getBurnPieceOutlineGeometry } from './get.burn.piece.outline.geometry';
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

const newBurnSceneToonBands = (): DataTexture => {
  const toonBands: DataTexture = new DataTexture(
    new Uint8Array(BURN_SCENE_TOON_BANDS),
    BURN_SCENE_TOON_BANDS.length,
    1,
    RedFormat,
  );

  // Nearest, so that the bands meet in a hard step.
  toonBands.minFilter = NearestFilter;
  toonBands.magFilter = NearestFilter;
  toonBands.needsUpdate = true;

  return toonBands;
};

// A line is thin, but a ray takes it for a wide target: it must not hide its part from a click.
const ignoreBurnOutlineRay = (): void => undefined;

export const newBurnSceneObjects = (model: BurnModel): BurnSceneObjects => {
  const group: Group = new Group();
  const toonBands: DataTexture = newBurnSceneToonBands();
  // The offset keeps the ink lines from sinking into the faces they lie on.
  const material: MeshToonMaterial = new MeshToonMaterial({
    vertexColors: true,
    gradientMap: toonBands,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const highlightMaterial: MeshToonMaterial = new MeshToonMaterial({
    vertexColors: true,
    gradientMap: toonBands,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    emissive: BURN_SCENE_HIGHLIGHT_COLOUR,
    emissiveIntensity: BURN_SCENE_HIGHLIGHT_INTENSITY,
  });
  const hoverMaterial: MeshToonMaterial = highlightMaterial.clone();

  hoverMaterial.emissiveIntensity = BURN_SCENE_HOVER_INTENSITY;

  const meshes: BurnSceneMesh[] = model.meshes.map((regionMesh: BurnRegionMesh): BurnSceneMesh => ({
    partId: regionMesh.partId,
    mesh: new Mesh(newBurnRegionGeometry(regionMesh), material),
  }));

  const outlineMaterial: LineBasicMaterial = new LineBasicMaterial({ color: BURN_SCENE_OUTLINE_COLOUR });
  const highlightOutlineMaterial: LineBasicMaterial = new LineBasicMaterial({ color: BURN_SCENE_HIGHLIGHT_COLOUR });
  const outlines: LineSegments[] = [];

  for (const { mesh } of meshes) {
    const outline: LineSegments = new LineSegments(
      getBurnPieceOutlineGeometry(mesh.geometry, model.thicknessMm),
      outlineMaterial,
    );

    outline.raycast = ignoreBurnOutlineRay;
    mesh.add(outline);
    outlines.push(outline);
    group.add(mesh);
  }

  return {
    group,
    meshes,
    material,
    highlightMaterial,
    hoverMaterial,
    toonBands,
    outlines,
    outlineMaterial,
    highlightOutlineMaterial,
  };
};
