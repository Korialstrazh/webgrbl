/**
 * How many mm a pointer move along the lift axis lifts a part, so that the part follows the pointer. Seen from nearly
 * straight above the axis is too short on screen to follow, so moving the pointer up lifts at a fixed rate.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Vector3 } from 'three';
import type { OrthographicCamera } from 'three';
import type { ElementSizePx } from '../hooks/interfaces/ElementSizePx';
import { BURN_SCENE_LIFT_AXIS_MIN_SCREEN_SHARE } from './burn.scene.constants';
import { getBurnSceneMmPerPx } from './get.burn.scene.mm.per.px';
import { getBurnScenePointPx } from './get.burn.scene.point.px';
import type { BurnScenePointPx } from './interfaces/BurnScenePointPx';

export const getBurnLiftChangeMm = (
  camera: OrthographicCamera,
  size: ElementSizePx,
  { xPx, yPx }: BurnScenePointPx,
): number => {
  // The camera is orthographic, so one mm of height looks the same everywhere in the scene.
  const start: BurnScenePointPx = getBurnScenePointPx(new Vector3(0, 0, 0), camera, size);
  const end: BurnScenePointPx = getBurnScenePointPx(new Vector3(0, 0, 1), camera, size);
  const axisXPx: number = end.xPx - start.xPx;
  const axisYPx: number = end.yPx - start.yPx;
  const axisPxPerMm: number = Math.hypot(axisXPx, axisYPx);
  const minAxisPxPerMm: number = BURN_SCENE_LIFT_AXIS_MIN_SCREEN_SHARE / getBurnSceneMmPerPx(camera, size.heightPx);

  return axisPxPerMm < minAxisPxPerMm
    ? -yPx / minAxisPxPerMm
    : (xPx * axisXPx + yPx * axisYPx) / (axisPxPerMm * axisPxPerMm);
};
