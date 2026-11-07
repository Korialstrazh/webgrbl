/**
 * Gets the jog line a double-click on empty bed sends, or undefined when the move is not safe now: the preference
 * is off, the laser is not connected and idle (a job, frame, homing, jog, alarm or hold is going on), the pointer
 * fires, or an overlay is open. The line is a plain jog, so the laser stays off and STOP and Escape cancel it like any
 * jog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getClampedWorkPositionFromBedPoint } from '../bed/get.clamped.work.position.from.bed.point';
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import { getAbsoluteJogCommand } from './get.absolute.jog.command';
import { getMoveAvailability } from './get.move.availability';
import type { BedDoubleClickMoveRequest } from './interfaces/BedDoubleClickMoveRequest';
import type { MoveAvailability } from './interfaces/MoveAvailability';

const isBedDoubleClickMoveAllowed = (request: BedDoubleClickMoveRequest): boolean => {
  const { canJog }: MoveAvailability = getMoveAvailability({
    isConnected: request.isConnected,
    machineState: request.machineState,
    hasHomingSwitches: false,
    isPointerFiring: request.isPointerFiring,
    isJobRunActive: request.isJobRunActive,
  });

  return request.isPreferenceOn && canJog && request.machineState === GRBL_MACHINE_STATE.IDLE && !request.isOverlayOpen;
};

export const getBedDoubleClickJogCommand = (request: BedDoubleClickMoveRequest): string | undefined =>
  isBedDoubleClickMoveAllowed(request)
    ? getAbsoluteJogCommand(getClampedWorkPositionFromBedPoint(request.bedPoint, request.machineArea), request.feedRate)
    : undefined;
