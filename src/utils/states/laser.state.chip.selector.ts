/**
 * What the top-bar laser chip shows, from what the app already knows: whether a laser is connected, whether the pointer
 * is held, whether a job runs, and the power in the last status report. A power report of 0 is not called off: the
 * report is a moment old, and a laser can be driven outside this app.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { selectIsConnected } from './grbl.connection.state';
import { selectIsJobRunActive } from './job.run.state';
import { selectIsLaserPointerFiring } from './laser.pointer.state';
import { selectMachineStatus } from './machine.status.state';
import type { AppRootState } from './new.store';

export const LASER_CHIP_STATE = {
  NOT_CONNECTED: 'not-connected',
  POINTER_ON: 'pointer-on',
  FIRING: 'firing',
  JOB_RUNNING: 'job-running',
  ZERO_POWER_REPORTED: 'zero-power-reported',
  POWER_UNKNOWN: 'power-unknown',
} as const;

export type LaserChipState = typeof LASER_CHIP_STATE[keyof typeof LASER_CHIP_STATE];

export const selectLaserChipState = (state: AppRootState): LaserChipState => {
  if (!selectIsConnected(state)) {
    return LASER_CHIP_STATE.NOT_CONNECTED;
  }

  if (selectIsLaserPointerFiring(state)) {
    return LASER_CHIP_STATE.POINTER_ON;
  }

  const status: GrblResolvedStatus | undefined = selectMachineStatus(state);

  if (status?.spindleSpeed) {
    return LASER_CHIP_STATE.FIRING;
  }

  if (selectIsJobRunActive(state)) {
    return LASER_CHIP_STATE.JOB_RUNNING;
  }

  return status?.spindleSpeed === 0 ? LASER_CHIP_STATE.ZERO_POWER_REPORTED : LASER_CHIP_STATE.POWER_UNKNOWN;
};
