/**
 * Decides whether the laser pointer may be fired for the connection and the machine state.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblMachineState } from '../grbl/grbl.constants';

export const getCanFireLaserPointer = (
  isConnected: boolean,
  machineState: GrblMachineState | undefined,
  isJobRunActive: boolean,
): boolean => isConnected && !isJobRunActive && machineState === GRBL_MACHINE_STATE.IDLE;
