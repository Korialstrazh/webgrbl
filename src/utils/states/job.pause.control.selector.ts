/**
 * Which pause control the job card offers now; the saga repeats this check before it sends anything.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_DOOR_SUBSTATE, GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import type { JobPauseControl } from './job.pause.control.constants';
import { selectIsJobRunActive } from './job.run.state';
import { selectIsLaserModeConfirmedOn } from './laser.mode.selector';
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

  return selectIsLaserModeConfirmedOn(state) ? JOB_PAUSE_CONTROL.PAUSE : JOB_PAUSE_CONTROL.PAUSE_BLOCKED;
};
