/**
 * Sizes the view of the orthographic camera so that the sheet and the highest lifted part fit, from any side.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { OrthographicCamera } from 'three';
import { getBurnSceneFrameRadiusMm } from './get.burn.scene.frame.radius.mm';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';

export const setBurnSceneCameraFrustum = (camera: OrthographicCamera, framing: BurnSceneCameraFraming): void => {
  const radiusMm: number = getBurnSceneFrameRadiusMm(framing);
  const halfHeightMm: number = radiusMm / Math.min(framing.aspectRatio, 1);
  const halfWidthMm: number = halfHeightMm * framing.aspectRatio;

  camera.left = -halfWidthMm;
  camera.right = halfWidthMm;
  camera.top = halfHeightMm;
  camera.bottom = -halfHeightMm;
  camera.updateProjectionMatrix();
};
