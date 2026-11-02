/**
 * Selectors of the toolpath's motion timeline. The timeline is planned on the main thread, once per toolpath and set
 * of GRBL settings (a single pass over the moves), and shared by the Toolpath view, the estimate readouts and the
 * playback. The estimate and playback only use a ready toolpath: a stale one is never shown as the current job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { createSelector } from '@reduxjs/toolkit';
import { getMachineMotionLimits } from '../toolpath/get.machine.motion.limits';
import { getMotionTimeline } from '../toolpath/get.motion.timeline';
import type { MotionTimeline } from '../toolpath/interfaces/MotionTimeline';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathBounds } from '../toolpath/interfaces/ToolpathBounds';
import { selectGrblSettings } from './grbl.connection.state';
import { selectToolpath, selectToolpathStatus } from './toolpath.state';
import { TOOLPATH_STATUS } from './toolpath.status.constants';
import type { ToolpathStatus } from './toolpath.status.constants';

/** The timeline of the latest toolpath, ready or not; undefined before the first toolpath. */
export const selectToolpathMotionTimeline = createSelector(
  [selectToolpath, selectGrblSettings],
  (toolpath: Toolpath | undefined, grblSettings: Record<number, string>): MotionTimeline | undefined =>
    toolpath && getMotionTimeline(toolpath, getMachineMotionLimits(grblSettings)),
);

/** The estimated job time in seconds, only while the toolpath matches the document. */
export const selectReadyToolpathTotalTimeS = createSelector(
  [selectToolpathStatus, selectToolpathMotionTimeline],
  (status: ToolpathStatus, timeline: MotionTimeline | undefined): number | undefined =>
    (status === TOOLPATH_STATUS.READY ? timeline?.totalTimeS : undefined),
);

/** The box around the ready toolpath, for the job size; undefined while the toolpath is not ready. */
export const selectReadyToolpathBounds = createSelector(
  [selectToolpathStatus, selectToolpath],
  (status: ToolpathStatus, toolpath: Toolpath | undefined): ToolpathBounds | undefined =>
    (status === TOOLPATH_STATUS.READY ? toolpath?.bounds : undefined),
);

/** Whether the simulation may play: only a ready toolpath that takes some time. */
export const selectIsSimulationPlayable = createSelector(
  [selectReadyToolpathTotalTimeS],
  (totalTimeS: number | undefined): boolean => !!totalTimeS,
);
