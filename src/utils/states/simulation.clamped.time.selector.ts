/**
 * The simulation time every reader shows: the stored time, kept inside the ready toolpath's job. The stored time is
 * not reset when only the machine limits change and the job becomes shorter, so without this the clock, the slider
 * and the head could show a time past the end of the job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { createSelector } from '@reduxjs/toolkit';
import { selectSimulationTimeS } from './simulation.state';
import { selectReadyToolpathTotalTimeS } from './toolpath.timeline.selectors';

export const selectClampedSimulationTimeS = createSelector(
  [selectSimulationTimeS, selectReadyToolpathTotalTimeS],
  (currentTimeS: number, totalTimeS: number | undefined): number => Math.min(currentTimeS, totalTimeS ?? 0),
);
