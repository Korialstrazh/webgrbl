/**
 * What the top-bar laser chip shows, from what the app already knows: whether a laser is connected, whether the pointer
 * is held, whether a job runs, and the power in the last status report. A report of 0 reads as off and a power above 0
 * as firing, with its percent of S max; the tooltip says it is the last report, as a laser can be driven elsewhere.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getNumberInRange } from '../get.number.in.range';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { getPointerSValueMax } from '../machine/get.pointer.s.value.max';
import { PERCENT_DIVISOR, PERCENT_MIN } from '../percent.constants';
import { getValidGcodeSValueMax } from '../toolpath/get.valid.gcode.s.value.max';
import { selectGrblSettings, selectIsConnected } from './grbl.connection.state';
import { selectIsJobRunActive } from './job.run.state';
import { selectIsLaserPointerFiring } from './laser.pointer.state';
import { selectActiveMachineProfile } from './machine.profile.state';
import { selectMachineStatus } from './machine.status.state';
import type { AppRootState } from './new.store';

export const LASER_CHIP_STATE = {
  NOT_CONNECTED: 'not-connected',
  POINTER_ON: 'pointer-on',
  FIRING: 'firing',
  JOB_RUNNING: 'job-running',
  OFF: 'off',
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

  return status?.spindleSpeed === 0 ? LASER_CHIP_STATE.OFF : LASER_CHIP_STATE.POWER_UNKNOWN;
};

/**
 * The reported power as a whole percent of S max (the laser's reported $30, else the active profile's), 0 to 100, or
 * undefined while the last report has no power.
 */
export const selectLaserChipPowerPercent = (state: AppRootState): number | undefined => {
  const spindleSpeed: number | undefined = selectMachineStatus(state)?.spindleSpeed;

  // eslint-disable-next-line no-restricted-syntax -- a reported 0 is a real power (off), distinct from no report
  if (spindleSpeed === undefined) {
    return undefined;
  }

  const sValueMax: number = getValidGcodeSValueMax(
    getPointerSValueMax(selectGrblSettings(state), selectActiveMachineProfile(state)),
  );

  return Math.round(getNumberInRange((spindleSpeed / sValueMax) * PERCENT_DIVISOR, PERCENT_MIN, PERCENT_DIVISOR));
};
