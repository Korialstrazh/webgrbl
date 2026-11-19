/**
 * Moves each part mesh of the 3D preview to the height of its lift; the sheet stays where it is.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnPartLiftsMm } from '../burn.model/interfaces/BurnPartLiftsMm';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';

export const applyBurnPartLifts = ({ meshes }: BurnSceneObjects, liftsMm: BurnPartLiftsMm): void => {
  for (const { partId, mesh } of meshes) {
    mesh.position.z = partId ? liftsMm[partId] ?? 0 : 0;
  }
};
