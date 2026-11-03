/**
 * Where the camera of the 3D preview stands when it looks at the frame from a direction.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Vector3 } from 'three';
import { BURN_SCENE_CAMERA_DISTANCE_RADIUSES } from './burn.scene.constants';
import { getBurnSceneFrameCentre } from './get.burn.scene.frame.centre';
import { getBurnSceneFrameRadiusMm } from './get.burn.scene.frame.radius.mm';
import type { BurnSceneCameraFraming } from './interfaces/BurnSceneCameraFraming';

export const getBurnSceneCameraPosition = (
  framing: BurnSceneCameraFraming,
  [directionX, directionY, directionZ]: readonly [number, number, number],
): Vector3 => new Vector3(directionX, directionY, directionZ)
  .setLength(getBurnSceneFrameRadiusMm(framing) * BURN_SCENE_CAMERA_DISTANCE_RADIUSES)
  .add(getBurnSceneFrameCentre(framing));
