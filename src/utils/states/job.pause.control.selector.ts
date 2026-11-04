/**
 * Which pause control the job card offers now; the saga repeats this check before it sends anything.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_DOOR_SUBSTATE, GRBL_MACHINE_STATE, GRBL_SETTING_LASER_MODE, GRBL_SETTING_ON_VALUE } from '../grbl/grbl.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { selectGrblSettings } from './grbl.connection.state';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import type { JobPauseControl } from './job.pause.control.constants';
import { selectIsJobRunActive, selectIsLaserModeUnconfirmed } from './job.run.state';
import { selectIsMachineMoving, selectMachineStatus } from './machine.status.state';
import type { AppRootState } from './new.store';

export const selectJobPauseControl = (state: AppRootState): JobPauseControl => {
  if (!selectIsJobRunActive(state)) {
    return JOB_PAUSE_CONTROL.HIDDEN;
  }

  const status: GrblResolvedStatus | undefined = selectMachineStatus(state);

  if (status?.machineState === GRBL_MACHINE_STATE.DOOR) {
    return status.machineSubstate === GRBL_DOOR_SUBSTATE.READY_TO_RESUME
      ? JOB_PAUSE_CONTROL.RESUME
      : JOB_PAUSE_CONTROL.RESUME_WAITING;
  }

  if (status?.machineState === GRBL_MACHINE_STATE.HOLD) {
    return selectIsMachineMoving(state) ? JOB_PAUSE_CONTROL.RESUME_WAITING : JOB_PAUSE_CONTROL.RESUME;
  }

  const isLaserModeConfirmedOn: boolean = !selectIsLaserModeUnconfirmed(state)
    && selectGrblSettings(state)[GRBL_SETTING_LASER_MODE] === GRBL_SETTING_ON_VALUE;

  return isLaserModeConfirmedOn ? JOB_PAUSE_CONTROL.PAUSE : JOB_PAUSE_CONTROL.PAUSE_BLOCKED;
};
