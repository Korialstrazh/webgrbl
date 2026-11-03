/**
 * Makes the selected part glow in the 3D preview, so the user can see what the lift axis moves.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';

export const applyBurnPartHighlight = (
  { meshes, material, highlightMaterial }: BurnSceneObjects,
  selectedPartId: number | undefined,
): void => {
  for (const { partId, mesh } of meshes) {
    mesh.material = partId && partId === selectedPartId ? highlightMaterial : material;
  }
};
