/**
 * Stands the lift axis on top of the middle of a mesh, wherever its lift has taken it. A mesh can hold no triangles,
 * and an empty box has no middle, so the axis then hides.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Box3 } from 'three';
import type { Group, Mesh } from 'three';

export const placeBurnLiftAxis = (liftAxis: Group, mesh: Mesh | undefined): void => {
  const bounds: Box3 = new Box3();

  if (mesh) {
    bounds.setFromObject(mesh);
  }

  const hasPlace: boolean = !bounds.isEmpty();

  liftAxis.visible = hasPlace;

  if (hasPlace) {
    bounds.getCenter(liftAxis.position);
    liftAxis.position.z = bounds.max.z;
  }
};
