/**
 * Gets the placement a handle gesture gives for the pointer's position: the rotate handle turns the object, a corner
 * handle scales it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import { BED_OBJECT_HANDLE } from './bed.objects.constants';
import { getRotatedObjectTransform } from './get.rotated.object.transform';
import { getScaledObjectTransform } from './get.scaled.object.transform';
import type { BedHandleGesture } from './interfaces/BedHandleGesture';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';

export const getHandleGestureTransform = (
  handleGesture: BedHandleGesture,
  point: BedMachinePoint,
  isShiftPressed: boolean,
): ProjectObjectTransform => {
  const { handle, startTransform, startPoint, artworkFrame } = handleGesture;

  if (handle === BED_OBJECT_HANDLE.ROTATE) {
    return getRotatedObjectTransform({ startTransform, startPoint, point, isSnapping: isShiftPressed });
  }

  return getScaledObjectTransform({
    startTransform,
    handle,
    pointerOffset: { x: point.x - startPoint.x, y: point.y - startPoint.y },
    isAspectRatioFree: isShiftPressed,
    artworkFrame,
  });
};
