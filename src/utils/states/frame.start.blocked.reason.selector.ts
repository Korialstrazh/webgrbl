/**
 * Why a frame cannot start now, as a text key; undefined when it can. The UI and the saga share it, so the saga never
 * relies on a disabled button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { createSelector } from '@reduxjs/toolkit';
import { getFrameBedOverrun } from '../frame/get.frame.bed.overrun';
import { getFrameRectangle } from '../frame/get.frame.rectangle';
import type { FrameBedOverrun } from '../frame/interfaces/FrameBedOverrun';
import type { FrameRectangle } from '../frame/interfaces/FrameRectangle';
import { DEFAULT } from '../localization/default.locales';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import { selectJobStartBlockedReasonKey } from './job.start.blocked.reason.selector';
import { selectIsLaserModeConfirmedOn } from './laser.mode.selector';
import { selectFrameMarginMm } from './machine.profile.state';
import { selectMachineStatus } from './machine.status.state';
import type { AppRootState } from './new.store';
import { selectToolpathMachineArea } from './toolpath.machine.area.selector';
import { selectToolpath } from './toolpath.state';

export const selectFrameRectangle = createSelector(
  [selectToolpath, selectFrameMarginMm],
  (toolpath: Toolpath | undefined, marginMm: number): FrameRectangle | undefined =>
    getFrameRectangle(toolpath?.moves ?? [], marginMm),
);

export const selectFrameBedOverrun = createSelector(
  [selectFrameRectangle, selectToolpathMachineArea],
  (rectangle: FrameRectangle | undefined, machineArea: ToolpathMachineArea): FrameBedOverrun | undefined =>
    rectangle && getFrameBedOverrun(rectangle, machineArea),
);

export const selectFrameStartBlockedReasonKey = (state: AppRootState): string | undefined => {
  const jobBlockedReasonKey: string | undefined = selectJobStartBlockedReasonKey(state);

  if (jobBlockedReasonKey) {
    return jobBlockedReasonKey;
  }

  if (!selectIsLaserModeConfirmedOn(state)) {
    return DEFAULT.FRAME_START_BLOCKED_LASER_MODE;
  }

  if (!selectFrameRectangle(state)) {
    return DEFAULT.FRAME_START_BLOCKED_NO_BURN_MOVES;
  }

  if (selectFrameBedOverrun(state)) {
    return DEFAULT.FRAME_START_BLOCKED_BED_OVERRUN;
  }

  // The frame returns the head to where it started, so without a work position the run would send nothing.
  return selectMachineStatus(state)?.workPosition ? undefined : DEFAULT.FRAME_START_BLOCKED_NO_WORK_POSITION;
};
