/**
 * Why a job cannot start now, as a text key; undefined when it can. The UI and the saga share it, so the saga never
 * relies on a disabled button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import { DEFAULT } from '../localization/default.locales';
import { selectIsConnected } from './grbl.connection.state';
import { selectIsJobRunActive } from './job.run.state';
import { selectIsLaserPointerFiring } from './laser.pointer.state';
import { selectActiveMachineProfile } from './machine.profile.state';
import { selectMachineStatus } from './machine.status.state';
import type { AppRootState } from './new.store';
import { selectToolpath, selectToolpathStatus } from './toolpath.state';
import { TOOLPATH_STATUS } from './toolpath.status.constants';

const hasReadyToolpathMoves = (state: AppRootState): boolean =>
  selectToolpathStatus(state) === TOOLPATH_STATUS.READY && Boolean(selectToolpath(state)?.moves.length);

const isMachineReadyForJob = (state: AppRootState): boolean =>
  !selectIsLaserPointerFiring(state) && selectMachineStatus(state)?.machineState === GRBL_MACHINE_STATE.IDLE;

export const selectJobStartBlockedReasonKey = (state: AppRootState): string | undefined => {
  if (selectIsJobRunActive(state)) {
    return DEFAULT.JOB_START_BLOCKED_RUNNING;
  }

  if (!selectIsConnected(state)) {
    return DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED;
  }

  if (!selectActiveMachineProfile(state)) {
    return DEFAULT.JOB_START_BLOCKED_NO_PROFILE;
  }

  if (!hasReadyToolpathMoves(state)) {
    return DEFAULT.JOB_START_BLOCKED_NO_TOOLPATH;
  }

  if (selectToolpath(state)?.warnings.length) {
    return DEFAULT.JOB_START_BLOCKED_WARNINGS;
  }

  if (!isMachineReadyForJob(state)) {
    return DEFAULT.JOB_START_BLOCKED_NOT_IDLE;
  }

  return undefined;
};
