/**
 * Formats the state field of a simulated status report: the machine state plus the substate GRBL prints for Hold.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_MACHINE_STATE, GRBL_STATUS_VALUE_SEPARATOR } from '../grbl.constants';
import { GRBL_SIMULATOR_HOLD_SUBSTATE, GRBL_SIMULATOR_MOTION_PHASE } from './grbl.simulator.constants';
import type { GrblMachineState } from '../grbl.constants';
import type { GrblSimulatorMotionPhase } from './grbl.simulator.constants';

const HOLD_SUBSTATE_BY_MOTION_PHASE: Readonly<Partial<Record<GrblSimulatorMotionPhase, number>>> = {
  [GRBL_SIMULATOR_MOTION_PHASE.HOLD_DECELERATING]: GRBL_SIMULATOR_HOLD_SUBSTATE.DECELERATING,
  [GRBL_SIMULATOR_MOTION_PHASE.HOLD_COMPLETE]: GRBL_SIMULATOR_HOLD_SUBSTATE.COMPLETE,
};

export const getSimulatorStateText = (
  machineState: GrblMachineState,
  motionPhase: GrblSimulatorMotionPhase,
): string => {
  const holdSubstate: number | undefined = HOLD_SUBSTATE_BY_MOTION_PHASE[motionPhase];
  const isHoldState: boolean = machineState === GRBL_MACHINE_STATE.HOLD;

  return isHoldState ? `${machineState}${GRBL_STATUS_VALUE_SEPARATOR}${holdSubstate}` : machineState;
};
