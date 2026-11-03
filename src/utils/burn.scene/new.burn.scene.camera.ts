/**
 * The orthographic camera of the 3D preview, looking at the sheet from the front and above, with Z up.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { OrthographicCamera } from 'three';
import type { Vector3 } from 'three';
import {
  BURN_SCENE_CAMERA_DIRECTION,
  BURN_SCENE_CAMERA_DISTANCE_RADIUSES,
  BURN_SCENE_CAMERA_FAR_DISTANCES,
} from './burn.scene.constants';
import { getBurnSceneCameraPosition } from './get.burn.scene.camera.position';
import { getBurnSceneFrameCentre } from './get.burn.scene.frame.centre';
import { getBurnSceneFrameRadiusMm } from './get.burn.scene.frame.radius.mm';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';
import { setBurnSceneCameraFrustum } from './set.burn.scene.camera.frustum';

export const newBurnSceneCamera = (framing: BurnSceneCameraFraming): OrthographicCamera => {
  const camera: OrthographicCamera = new OrthographicCamera();
  const radiusMm: number = getBurnSceneFrameRadiusMm(framing);
  const distanceMm: number = radiusMm * BURN_SCENE_CAMERA_DISTANCE_RADIUSES;
  const centre: Vector3 = getBurnSceneFrameCentre(framing);

  camera.up.set(0, 0, 1);
  camera.position.copy(getBurnSceneCameraPosition(framing, BURN_SCENE_CAMERA_DIRECTION));
  camera.near = 0;
  camera.far = distanceMm * BURN_SCENE_CAMERA_FAR_DISTANCES;
  camera.lookAt(centre);
  camera.updateMatrixWorld();
  setBurnSceneCameraFrustum(camera, framing);

  return camera;
};
