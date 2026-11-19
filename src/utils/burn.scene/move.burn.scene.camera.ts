/**
 * Puts the camera of the 3D preview back on the frame from a direction, at the first zoom and without any pan.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { OrthographicCamera } from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getBurnSceneCameraPosition } from './get.burn.scene.camera.position';
import { getBurnSceneFrameCentre } from './get.burn.scene.frame.centre';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';

export const moveBurnSceneCamera = (
  camera: OrthographicCamera,
  controls: OrbitControls,
  framing: BurnSceneCameraFraming,
  direction: readonly [number, number, number],
): void => {
  controls.target.copy(getBurnSceneFrameCentre(framing));
  camera.position.copy(getBurnSceneCameraPosition(framing, direction));
  camera.zoom = 1;
  camera.updateProjectionMatrix();
  controls.update();
};
