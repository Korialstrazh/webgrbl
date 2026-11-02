/**
 * Gets a bed point as the machine coordinates of its origin corner: a right-hand origin mirrors x and a back
 * origin mirrors y.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import type { MachineOriginCorner } from '../profiles/machine.profile.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { OriginWorkArea } from './interfaces/OriginWorkArea';

const RIGHT_ORIGIN_CORNERS: readonly MachineOriginCorner[] = [
  MACHINE_ORIGIN_CORNER.FRONT_RIGHT,
  MACHINE_ORIGIN_CORNER.BACK_RIGHT,
];
const BACK_ORIGIN_CORNERS: readonly MachineOriginCorner[] = [
  MACHINE_ORIGIN_CORNER.BACK_LEFT,
  MACHINE_ORIGIN_CORNER.BACK_RIGHT,
];

export const getOriginMappedPoint = (
  point: GeometryPoint,
  originCorner: MachineOriginCorner,
  workArea: OriginWorkArea,
): GeometryPoint => {
  const isRightOrigin: boolean = RIGHT_ORIGIN_CORNERS.includes(originCorner);
  const isBackOrigin: boolean = BACK_ORIGIN_CORNERS.includes(originCorner);

  return {
    x: isRightOrigin ? workArea.workAreaXMm - point.x : point.x,
    y: isBackOrigin ? workArea.workAreaYMm - point.y : point.y,
  };
};
