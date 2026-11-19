/**
 * Frees the geometries and materials of the objects of a burn model.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
