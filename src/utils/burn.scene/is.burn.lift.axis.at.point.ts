/**
 * Whether a place in the view is close enough to the lift axis to grab it. It works on screen rather than with a ray,
 * so the thin axis keeps a full touch target, also seen end-on from above.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Vector3 } from 'three';
import type { Camera } from 'three';
import type { ElementSizePx } from '../hooks/interfaces/ElementSizePx';
import { BURN_SCENE_LIFT_AXIS_GRAB_RADIUS_PX } from './burn.scene.constants';
import { getBurnScenePointPx } from './get.burn.scene.point.px';
import type { BurnScenePointPx } from './interfaces/BurnScenePointPx';

export const isBurnLiftAxisAtPoint = (
  base: Vector3,
  lengthMm: number,
  camera: Camera,
  size: ElementSizePx,
  { xPx, yPx }: BurnScenePointPx,
): boolean => {
  const start: BurnScenePointPx = getBurnScenePointPx(base, camera, size);
  const end: BurnScenePointPx = getBurnScenePointPx(base.clone().setZ(base.z + lengthMm), camera, size);
  const axisXPx: number = end.xPx - start.xPx;
  const axisYPx: number = end.yPx - start.yPx;
  const axisLengthSquaredPx: number = axisXPx * axisXPx + axisYPx * axisYPx;
  const projectedShare: number = axisLengthSquaredPx
    ? ((xPx - start.xPx) * axisXPx + (yPx - start.yPx) * axisYPx) / axisLengthSquaredPx
    : 0;
  const clampedShare: number = Math.min(Math.max(projectedShare, 0), 1);

  return Math.hypot(xPx - start.xPx - clampedShare * axisXPx, yPx - start.yPx - clampedShare * axisYPx)
    <= BURN_SCENE_LIFT_AXIS_GRAB_RADIUS_PX;
};
