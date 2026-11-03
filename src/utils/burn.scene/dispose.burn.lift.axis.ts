/**
 * Frees the geometries and materials of the lift axis arrow.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Mesh } from 'three';
import type { Group, Material, Object3D } from 'three';

export const disposeBurnLiftAxis = (liftAxis: Group): void => {
  const axisMaterials: Set<Material> = new Set<Material>();

  liftAxis.traverse((axisObject: Object3D): void => {
    if (axisObject instanceof Mesh) {
      axisObject.geometry.dispose();
      axisMaterials.add(axisObject.material as Material);
    }
  });

  for (const axisMaterial of axisMaterials) {
    axisMaterial.dispose();
  }
};
