/**
 * Gets an object turned by a rotate gesture: by the angle the pointer has turned around the box centre since the press,
 * so grabbing the handle a little off its middle does not make the object jump. With Shift the angle snaps to the
 * nearest 15 degrees. The angle stays between 0 and 360; only the rotation changes, as the box turns around its centre.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import { HALF_BOX_FACTOR, HALF_TURN_DEG, ROTATION_SNAP_DEG } from '../../utils/project/project.constants';
import { getNormalizedRotationDeg } from '../../utils/project/get.normalized.rotation.deg';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';
import type { ObjectRotateInput } from './interfaces/ObjectRotateInput';

const getAngleFromCenterDeg = (center: BedMachinePoint, point: BedMachinePoint): number =>
  Math.atan2(point.y - center.y, point.x - center.x) * HALF_TURN_DEG / Math.PI;

const getSnappedRotationDeg = (rotationDeg: number): number =>
  getNormalizedRotationDeg(Math.round(rotationDeg / ROTATION_SNAP_DEG) * ROTATION_SNAP_DEG);

export const getRotatedObjectTransform = (input: ObjectRotateInput): ProjectObjectTransform => {
  const { startTransform, startPoint, point, isSnapping } = input;
  const center: BedMachinePoint = {
    x: startTransform.xMm + startTransform.widthMm * HALF_BOX_FACTOR,
    y: startTransform.yMm + startTransform.heightMm * HALF_BOX_FACTOR,
  };
  const turnDeg: number = getAngleFromCenterDeg(center, point) - getAngleFromCenterDeg(center, startPoint);
  const rotationDeg: number = getNormalizedRotationDeg(startTransform.rotationDeg + turnDeg);

  return { ...startTransform, rotationDeg: isSnapping ? getSnappedRotationDeg(rotationDeg) : rotationDeg };
};
