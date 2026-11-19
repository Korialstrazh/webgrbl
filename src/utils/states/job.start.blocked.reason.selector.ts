/**
 * Why a job cannot start now, as a text key; undefined when it can. Artwork that reaches past the bed in the same
 * points the G-code sends blocks it too. The UI and the saga share it, so the saga never
 * relies on a disabled button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { createSelector } from '@reduxjs/toolkit';
import type { FrameBedOverrun } from '../frame/interfaces/FrameBedOverrun';
import { GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import { DEFAULT } from '../localization/default.locales';
import { selectIsConnected } from './grbl.connection.state';
import { selectIsJobRunActive } from './job.run.state';
import { selectIsLaserPointerFiring } from './laser.pointer.state';
import { selectActiveMachineProfile } from './machine.profile.state';
import { selectMachineStatus } from './machine.status.state';
import type { AppRootState } from './new.store';
import { getToolpathBedOverrun } from '../toolpath/get.toolpath.bed.overrun';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import { selectToolpathMachineArea } from './toolpath.machine.area.selector';
import { selectToolpath, selectToolpathStatus } from './toolpath.state';
import { TOOLPATH_STATUS } from './toolpath.status.constants';
import { selectToolpathWarningCount } from './toolpath.warnings.selector';

const hasReadyToolpathMoves = (state: AppRootState): boolean =>
  selectToolpathStatus(state) === TOOLPATH_STATUS.READY && Boolean(selectToolpath(state)?.moves.length);

const isMachineReadyForJob = (state: AppRootState): boolean =>
  !selectIsLaserPointerFiring(state) && selectMachineStatus(state)?.machineState === GRBL_MACHINE_STATE.IDLE;

/** How far the job's moves leave the bed, the same points the G-code sends; undefined when they stay on it. */
export const selectToolpathBedOverrun = createSelector(
  [selectToolpath, selectToolpathMachineArea],
  (toolpath: Toolpath | undefined, machineArea: ToolpathMachineArea): FrameBedOverrun | undefined =>
    getToolpathBedOverrun(toolpath?.moves ?? [], machineArea),
);

interface JobStartCheck {
  /** Whether the check holds Start job back in this state. */
  isBlocking: (state: AppRootState) => boolean;
  /** The text key of the reason. */
  reasonKey: string;
}

const JOB_START_CHECKS: readonly JobStartCheck[] = [
  {
    isBlocking: (state: AppRootState): boolean => !selectIsConnected(state),
    reasonKey: DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED,
  },
  {
    isBlocking: (state: AppRootState): boolean => !selectActiveMachineProfile(state),
    reasonKey: DEFAULT.JOB_START_BLOCKED_NO_PROFILE,
  },
  {
    isBlocking: (state: AppRootState): boolean => !hasReadyToolpathMoves(state),
    reasonKey: DEFAULT.JOB_START_BLOCKED_NO_TOOLPATH,
  },
  {
    isBlocking: (state: AppRootState): boolean => Boolean(selectToolpathBedOverrun(state)),
    reasonKey: DEFAULT.JOB_START_BLOCKED_OFF_BED,
  },
  {
    isBlocking: (state: AppRootState): boolean => Boolean(selectToolpathWarningCount(state)),
    reasonKey: DEFAULT.JOB_START_BLOCKED_WARNINGS,
  },
  {
    isBlocking: (state: AppRootState): boolean => !isMachineReadyForJob(state),
    reasonKey: DEFAULT.JOB_START_BLOCKED_NOT_IDLE,
  },
];

const RUNNING_REASON_KEYS: readonly string[] = [DEFAULT.JOB_START_BLOCKED_RUNNING];
const NO_REASON_KEYS: readonly string[] = [];

/**
 * Every reason a job cannot start now, most important first; empty when it can. A new list comes back on each call
 * with reasons, so a component reads it with shallowEqual.
 */
export const selectJobStartBlockedReasonKeys = (state: AppRootState): readonly string[] => {
  if (selectIsJobRunActive(state)) {
    return RUNNING_REASON_KEYS;
  }

  const reasonKeys: string[] = JOB_START_CHECKS
    .filter((check: JobStartCheck): boolean => check.isBlocking(state))
    .map((check: JobStartCheck): string => check.reasonKey);

  return reasonKeys.length ? reasonKeys : NO_REASON_KEYS;
};

export const selectJobStartBlockedReasonKey = (state: AppRootState): string | undefined => {
  if (selectIsJobRunActive(state)) {
    return DEFAULT.JOB_START_BLOCKED_RUNNING;
  }

  return JOB_START_CHECKS.find((check: JobStartCheck): boolean => check.isBlocking(state))?.reasonKey;
};
