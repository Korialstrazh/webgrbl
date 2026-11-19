/**
 * Sizes the view of the orthographic camera so that the sheet and a part lifted a few thicknesses fit, from any side.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
