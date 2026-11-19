/**
 * Where the camera of the 3D preview stands when it looks at the frame from a direction.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
