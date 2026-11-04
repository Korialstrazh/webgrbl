/**
 * Decides which move controls are safe to use for the connection, the machine state and the laser pointer. Nothing
 * moves while the pointer fires, since a move would drag the lit beam along its path.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblMachineState } from '../grbl/grbl.constants';
import type { MoveAvailability } from './interfaces/MoveAvailability';
import type { MoveAvailabilityConditions } from './interfaces/MoveAvailabilityConditions';

const JOG_MACHINE_STATES: readonly (GrblMachineState | undefined)[] = [GRBL_MACHINE_STATE.IDLE, GRBL_MACHINE_STATE.JOG];
const HOME_MACHINE_STATES: readonly (GrblMachineState | undefined)[] = [
  GRBL_MACHINE_STATE.IDLE,
  GRBL_MACHINE_STATE.ALARM,
];

export const getMoveAvailability = ({
  isConnected,
  machineState,
  hasHomingSwitches,
  isPointerFiring,
  isJobRunActive,
}: MoveAvailabilityConditions): MoveAvailability => {
  const canMoveNow: boolean = isConnected && !isPointerFiring && !isJobRunActive;

  return {
    canJog: canMoveNow && JOG_MACHINE_STATES.includes(machineState),
    canHome: canMoveNow && hasHomingSwitches && HOME_MACHINE_STATES.includes(machineState),
    canSetZero: canMoveNow && machineState === GRBL_MACHINE_STATE.IDLE,
  };
};
