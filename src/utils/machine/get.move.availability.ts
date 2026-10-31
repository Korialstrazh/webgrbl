/**
 * Decides which move controls are safe to use for the connection and the machine state.
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

const JOG_MACHINE_STATES: readonly (GrblMachineState | undefined)[] = [GRBL_MACHINE_STATE.IDLE, GRBL_MACHINE_STATE.JOG];
const HOME_MACHINE_STATES: readonly (GrblMachineState | undefined)[] = [
  GRBL_MACHINE_STATE.IDLE,
  GRBL_MACHINE_STATE.ALARM,
];

export const getMoveAvailability = (
  isConnected: boolean,
  machineState: GrblMachineState | undefined,
  hasHomingSwitches: boolean,
): MoveAvailability => ({
  canJog: isConnected && JOG_MACHINE_STATES.includes(machineState),
  canHome: isConnected && hasHomingSwitches && HOME_MACHINE_STATES.includes(machineState),
  canSetZero: isConnected && machineState === GRBL_MACHINE_STATE.IDLE,
});
