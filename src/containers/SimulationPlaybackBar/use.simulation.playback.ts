/**
 * Plays the simulation while it is playing: an animation frame loop advances the time by the real time since the
 * previous frame times the speed, and pauses at the end of the job. The loop reads the store at each frame, so it
 * always uses the latest time, speed and total. It stops with the pause and when the bar goes away; the bar going
 * away (another view) also pauses, so a hidden playback never runs on.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MILLISECONDS_PER_SECOND } from '../../utils/machine/machine.command.constants';
import type { AppRootState, AppStore } from '../../utils/states/new.store';
import {
  SimulationPaused,
  SimulationTimeSet,
  selectIsSimulationPlaying,
  selectSimulationSpeed,
  selectSimulationTimeS,
} from '../../utils/states/simulation.state';
import { selectReadyToolpathTotalTimeS } from '../../utils/states/toolpath.timeline.selectors';
import { useAppStore } from '../../utils/states/use.app.store';
import { getClampedSimulationTimeS } from '../../utils/toolpath/get.clamped.simulation.time.s';
import { LONGEST_FRAME_REAL_S } from './simulation.playback.constants';

/** The real time between two frames in seconds, never below 0 and never above one short frame. */
const getFrameElapsedRealS = (previousTimestampMs: number, timestampMs: number): number =>
  Math.min(Math.max(timestampMs - previousTimestampMs, 0) / MILLISECONDS_PER_SECOND, LONGEST_FRAME_REAL_S);

/** The simulation time one frame later, kept inside the job. */
const getNextSimulationTimeS = (state: AppRootState, elapsedRealS: number, totalTimeS: number): number =>
  getClampedSimulationTimeS(selectSimulationTimeS(state) + elapsedRealS * selectSimulationSpeed(state), totalTimeS);

/** Runs the frame loop until the end of the job; gives the function that stops it. */
const startSimulationFrameLoop = (store: AppStore): (() => void) => {
  let frameRequestId = 0;
  let previousTimestampMs: number | undefined;

  const advanceSimulationFrame = (timestampMs: number): void => {
    const elapsedRealS: number = getFrameElapsedRealS(previousTimestampMs ?? timestampMs, timestampMs);
    const totalTimeS: number = selectReadyToolpathTotalTimeS(store.getState()) ?? 0;
    const nextTimeS: number = getNextSimulationTimeS(store.getState(), elapsedRealS, totalTimeS);

    previousTimestampMs = timestampMs;
    store.dispatch(new SimulationTimeSet({ timeS: nextTimeS }));

    if (nextTimeS < totalTimeS) {
      frameRequestId = requestAnimationFrame(advanceSimulationFrame);

      return;
    }

    store.dispatch(new SimulationPaused());
  };

  frameRequestId = requestAnimationFrame(advanceSimulationFrame);

  return (): void => {
    cancelAnimationFrame(frameRequestId);
  };
};

export const useSimulationPlayback = (): void => {
  const store: AppStore = useAppStore();
  const isPlaying: boolean = useSelector(selectIsSimulationPlaying);

  useEffect(() => (isPlaying ? startSimulationFrameLoop(store) : undefined), [isPlaying, store]);

  useEffect(() => (): void => {
    store.dispatch(new SimulationPaused());
  }, [store]);
};
