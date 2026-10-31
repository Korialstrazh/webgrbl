/**
 * Works out the GRBL machine state of the simulated controller from its lock, check mode and motion phase.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_MACHINE_STATE } from '../grbl.constants';
import { GRBL_SIMULATOR_MOTION_PHASE } from './grbl.simulator.constants';
import type { GrblMachineState } from '../grbl.constants';
import type { GrblSimulatorMotionPhase } from './grbl.simulator.constants';

const MACHINE_STATE_BY_MOTION_PHASE: Readonly<Record<GrblSimulatorMotionPhase, GrblMachineState>> = {
  [GRBL_SIMULATOR_MOTION_PHASE.IDLE]: GRBL_MACHINE_STATE.IDLE,
  [GRBL_SIMULATOR_MOTION_PHASE.RUN]: GRBL_MACHINE_STATE.RUN,
  [GRBL_SIMULATOR_MOTION_PHASE.JOG]: GRBL_MACHINE_STATE.JOG,
  [GRBL_SIMULATOR_MOTION_PHASE.JOG_CANCELLING]: GRBL_MACHINE_STATE.JOG,
  [GRBL_SIMULATOR_MOTION_PHASE.HOLD_DECELERATING]: GRBL_MACHINE_STATE.HOLD,
  [GRBL_SIMULATOR_MOTION_PHASE.HOLD_COMPLETE]: GRBL_MACHINE_STATE.HOLD,
};

export const getSimulatorMachineState = (
  isAlarmLocked: boolean,
  isCheckMode: boolean,
  motionPhase: GrblSimulatorMotionPhase,
): GrblMachineState => {
  if (isAlarmLocked) {
    return GRBL_MACHINE_STATE.ALARM;
  }

  return isCheckMode ? GRBL_MACHINE_STATE.CHECK : MACHINE_STATE_BY_MOTION_PHASE[motionPhase];
};
