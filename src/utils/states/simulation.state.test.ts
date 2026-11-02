import { describe, expect, it } from 'vitest';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { Action } from './action';
import { ProjectObjectsDeleted } from './project.document.state';
import {
  SimulationPaused,
  SimulationPlayToggled,
  SimulationReset,
  SimulationSpeedSet,
  SimulationTimeSet,
  simulationReducer,
} from './simulation.state';
import type { SimulationState } from './simulation.state';
import { DEFAULT_SIMULATION_SPEED, SIMULATION_SPEED_FIFTY_TIMES } from './simulation.speed.constants';
import { ToolpathReady } from './toolpath.state';

const MIDDLE_TIME_S = 12.5;
const NEGATIVE_TIME_S = -3;

class UnknownAction extends Action {
  public static readonly type: string = 'unknown action';
}

const getInitialState = (): SimulationState => simulationReducer(undefined, new UnknownAction());

const getPlayingStateAt = (timeS: number): SimulationState => simulationReducer(
  simulationReducer(getInitialState(), new SimulationTimeSet({ timeS })),
  new SimulationPlayToggled(),
);

describe(simulationReducer.name, () => {
  it('starts paused at time 0 at normal speed', () => {
    expect(getInitialState()).toEqual({ currentTimeS: 0, isPlaying: false, speed: DEFAULT_SIMULATION_SPEED });
  });

  it('sets the time and never goes below 0', () => {
    expect(simulationReducer(getInitialState(), new SimulationTimeSet({ timeS: MIDDLE_TIME_S })).currentTimeS)
      .toBe(MIDDLE_TIME_S);
    expect(simulationReducer(getInitialState(), new SimulationTimeSet({ timeS: NEGATIVE_TIME_S })).currentTimeS)
      .toBe(0);
  });

  it('toggles play and pause', () => {
    const playingState: SimulationState = getPlayingStateAt(MIDDLE_TIME_S);

    expect(playingState.isPlaying).toBe(true);
    expect(simulationReducer(playingState, new SimulationPlayToggled()).isPlaying).toBe(false);
  });

  it('pauses on a pause and keeps the time, also when already paused', () => {
    const pausedState: SimulationState = simulationReducer(getPlayingStateAt(MIDDLE_TIME_S), new SimulationPaused());

    expect(pausedState).toMatchObject({ currentTimeS: MIDDLE_TIME_S, isPlaying: false });
    expect(simulationReducer(pausedState, new SimulationPaused())).toEqual(pausedState);
  });

  it('keeps the chosen speed through a reset', () => {
    const fastState: SimulationState = simulationReducer(
      getPlayingStateAt(MIDDLE_TIME_S),
      new SimulationSpeedSet({ speed: SIMULATION_SPEED_FIFTY_TIMES }),
    );

    expect(simulationReducer(fastState, new SimulationReset())).toEqual({
      currentTimeS: 0,
      isPlaying: false,
      speed: SIMULATION_SPEED_FIFTY_TIMES,
    });
  });

  it('goes back to time 0 and pauses when a new toolpath is ready', () => {
    const readyState: SimulationState = simulationReducer(
      getPlayingStateAt(MIDDLE_TIME_S),
      new ToolpathReady({ toolpath: newToolpath(), documentVersion: 0 }),
    );

    expect(readyState).toMatchObject({ currentTimeS: 0, isPlaying: false });
  });

  it('goes back to time 0 and pauses when the document changes and the toolpath goes stale', () => {
    const staleState: SimulationState = simulationReducer(
      getPlayingStateAt(MIDDLE_TIME_S),
      new ProjectObjectsDeleted({ objectIds: [] }),
    );

    expect(staleState).toMatchObject({ currentTimeS: 0, isPlaying: false });
  });
});
