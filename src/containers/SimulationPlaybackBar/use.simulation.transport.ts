/**
 * The actions of the playback bar's controls. They only act while the toolpath may play; Play at the end of the job
 * starts again from 0, and every new time is kept inside the job here, since the reducer does not know its total.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../utils/states/new.store';
import {
  SimulationPlayToggled,
  SimulationSpeedSet,
  SimulationTimeSet,
  selectIsSimulationPlaying,
  selectSimulationTimeS,
} from '../../utils/states/simulation.state';
import type { SimulationSpeed } from '../../utils/states/simulation.speed.constants';
import { selectIsSimulationPlayable, selectReadyToolpathTotalTimeS } from '../../utils/states/toolpath.timeline.selectors';
import { getClampedSimulationTimeS } from '../../utils/toolpath/get.clamped.simulation.time.s';
import type { SimulationTransport } from './interfaces/SimulationTransport';
import { SIMULATION_PLAY_TOGGLE_KEY } from './simulation.playback.constants';

/** A focused button or input (a speed option) handles Space itself, so the bar leaves the key to it. */
const isSpaceHandledByTarget = (target: EventTarget): boolean =>
  target instanceof HTMLButtonElement || target instanceof HTMLInputElement;

/** Whether the key press is a single Space the bar handles, not one held down or taken by a control. */
const isPlayToggleKeyPress = (keyEvent: KeyboardEvent<HTMLDivElement>): boolean =>
  keyEvent.key === SIMULATION_PLAY_TOGGLE_KEY && !keyEvent.repeat && !isSpaceHandledByTarget(keyEvent.target);

/** Whether Play is pressed with the time at the end of the job, so the playback has to start again from 0. */
const isPlayPressedAtEnd = (isPlaying: boolean, currentTimeS: number, totalTimeS: number): boolean =>
  !isPlaying && currentTimeS >= totalTimeS;

export const useSimulationTransport = (): SimulationTransport => {
  const dispatch: AppDispatch = useDispatch();
  const isPlayable: boolean = useSelector(selectIsSimulationPlayable);
  const isPlaying: boolean = useSelector(selectIsSimulationPlaying);
  const currentTimeS: number = useSelector(selectSimulationTimeS);
  const totalTimeS: number = useSelector(selectReadyToolpathTotalTimeS) ?? 0;

  const setSimulationTime = (timeS: number): void => {
    dispatch(new SimulationTimeSet({ timeS: getClampedSimulationTimeS(timeS, totalTimeS) }));
  };

  const toggleSimulationPlay = (): void => {
    if (!isPlayable) {
      return;
    }

    if (isPlayPressedAtEnd(isPlaying, currentTimeS, totalTimeS)) {
      setSimulationTime(0);
    }

    dispatch(new SimulationPlayToggled());
  };

  const handleBarKeyDown = (keyEvent: KeyboardEvent<HTMLDivElement>): void => {
    if (isPlayToggleKeyPress(keyEvent)) {
      keyEvent.preventDefault();
      toggleSimulationPlay();
    }
  };

  return {
    toggleSimulationPlay,
    goToSimulationStart: () => setSimulationTime(0),
    goToSimulationEnd: () => setSimulationTime(totalTimeS),
    setSimulationTime,
    setSimulationSpeed: (speed: SimulationSpeed) => dispatch(new SimulationSpeedSet({ speed })),
    handleBarKeyDown,
  };
};
