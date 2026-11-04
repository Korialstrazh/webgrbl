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
import { GRBL_HOLD_SUBSTATE, GRBL_MACHINE_STATE, GRBL_SETTING_LASER_MODE } from '../grbl/grbl.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { selectGrblSettings } from './grbl.connection.state';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import type { JobPauseControl } from './job.pause.control.constants';
import { selectIsJobRunActive } from './job.run.state';
import { selectMachineStatus } from './machine.status.state';
import type { AppRootState } from './new.store';

const LASER_MODE_ON_VALUE = '1';

export const selectJobPauseControl = (state: AppRootState): JobPauseControl => {
  if (!selectIsJobRunActive(state)) {
    return JOB_PAUSE_CONTROL.HIDDEN;
  }

  const status: GrblResolvedStatus | undefined = selectMachineStatus(state);

  if (status?.machineState === GRBL_MACHINE_STATE.DOOR) {
    return JOB_PAUSE_CONTROL.RESUME_WAITING;
  }

  if (status?.machineState === GRBL_MACHINE_STATE.HOLD) {
    return status.machineSubstate === GRBL_HOLD_SUBSTATE.COMPLETE
      ? JOB_PAUSE_CONTROL.RESUME
      : JOB_PAUSE_CONTROL.RESUME_WAITING;
  }

  return selectGrblSettings(state)[GRBL_SETTING_LASER_MODE] === LASER_MODE_ON_VALUE
    ? JOB_PAUSE_CONTROL.PAUSE
    : JOB_PAUSE_CONTROL.PAUSE_BLOCKED;
};
