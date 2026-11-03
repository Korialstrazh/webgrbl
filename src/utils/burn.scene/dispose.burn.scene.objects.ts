/**
 * Frees the geometries and materials of the objects of a burn model.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';

export const disposeBurnSceneObjects = (objects: BurnSceneObjects): void => {
  objects.material.dispose();
  objects.highlightMaterial.dispose();
  objects.hoverMaterial.dispose();
  objects.highlightOutlineMaterial.dispose();
  objects.toonBands.dispose();
  objects.outlineMaterial.dispose();

  for (const outline of objects.outlines) {
    outline.geometry.dispose();
  }

  for (const { mesh } of objects.meshes) {
    mesh.geometry.dispose();
  }
};
