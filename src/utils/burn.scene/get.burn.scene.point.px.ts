/**
 * Where a point of the scene shows in the view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Camera, Vector3 } from 'three';
import type { ElementSizePx } from '../hooks/interfaces/ElementSizePx';
import type { BurnScenePointPx } from './interfaces/BurnScenePointPx';

const NDC_SPAN = 2;

export const getBurnScenePointPx = (
  point: Vector3,
  camera: Camera,
  { widthPx, heightPx }: ElementSizePx,
): BurnScenePointPx => {
  // Only a render refreshes the matrix on its own, and an orbit may have come after the last one.
  camera.updateMatrixWorld();

  const { x: xNdc, y: yNdc }: Vector3 = point.clone().project(camera);

  return { xPx: ((xNdc + 1) / NDC_SPAN) * widthPx, yPx: ((1 - yNdc) / NDC_SPAN) * heightPx };
};
