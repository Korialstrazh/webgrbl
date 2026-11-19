/**
 * Where a work position lies on the bed drawing, by the same origin mapping as the G-code, so the head is drawn where
 * a job point at that spot would burn. The machine position cannot be used: without homing its zero is wherever the
 * machine was turned on.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblAxisPosition } from '../grbl/interfaces/GrblAxisPosition';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';

export const getBedPointFromWorkPosition = (
  workPosition: GrblAxisPosition,
  machineArea: ToolpathMachineArea,
): GrblAxisPosition => ({
  ...workPosition,
  ...getOriginMappedPoint(workPosition, machineArea.originCorner, machineArea),
});
