/**
 * Where a point of the bed drawing lies as a work position, held inside the work area. The bed drawing places a work
 * position by the origin mapping, which only mirrors axes, so the same mapping turns a bed point back into a work
 * position.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getNumberInRange } from '../get.number.in.range';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';

export const getClampedWorkPositionFromBedPoint = (
  bedPoint: GeometryPoint,
  machineArea: ToolpathMachineArea,
): GeometryPoint => {
  const workPosition: GeometryPoint = getOriginMappedPoint(bedPoint, machineArea.originCorner, machineArea);

  return {
    x: getNumberInRange(workPosition.x, 0, machineArea.workAreaXMm),
    y: getNumberInRange(workPosition.y, 0, machineArea.workAreaYMm),
  };
};
