/**
 * Moves each part mesh of the 3D preview to the height of its lift; the sheet stays where it is.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnPartLiftsMm } from '../burn.model/interfaces/BurnPartLiftsMm';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';

export const applyBurnPartLifts = ({ meshes }: BurnSceneObjects, liftsMm: BurnPartLiftsMm): void => {
  for (const { partId, mesh } of meshes) {
    mesh.position.z = partId ? liftsMm[partId] ?? 0 : 0;
  }
};
