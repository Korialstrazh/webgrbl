/**
 * Decides whether the laser pointer may be fired for the connection and the machine state.
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

export const getCanFireLaserPointer = (isConnected: boolean, machineState: GrblMachineState | undefined): boolean =>
  isConnected && machineState === GRBL_MACHINE_STATE.IDLE;
