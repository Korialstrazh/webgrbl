/**
 * Marks parts in the 3D preview: the selected one glows with an orange ink line, so the user can see what the lift axis
 * moves, and the one under the pointer or its row glows softly. Selection wins when a part is both.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MeshToonMaterial } from 'three';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';

export const applyBurnPartHighlight = (
  objects: BurnSceneObjects,
  selectedPartId: number | undefined,
  hoveredPartId?: number,
): void => {
  const { meshes, material, highlightMaterial, hoverMaterial, outlines, outlineMaterial, highlightOutlineMaterial } = objects;

  for (const [meshIndex, { partId, mesh }] of meshes.entries()) {
    const isSelected: boolean = !!partId && partId === selectedPartId;
    const isHovered: boolean = !!partId && partId === hoveredPartId;
    const hoverOrPlainMaterial: MeshToonMaterial = isHovered ? hoverMaterial : material;
    const outline = outlines[meshIndex];

    mesh.material = isSelected ? highlightMaterial : hoverOrPlainMaterial;

    if (outline) {
      outline.material = isSelected ? highlightOutlineMaterial : outlineMaterial;
    }
  }
};
