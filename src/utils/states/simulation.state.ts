/**
 * The toolpath simulation: the second of the estimated job time the Toolpath view shows, whether it plays, and how
 * fast. A new ready toolpath, a new generation and every document change (which makes the toolpath stale) send it
 * back to time 0 and pause it, so a playback never runs on a toolpath that no longer matches the design.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { SimulationSpeedPayload } from './interfaces/SimulationSpeedPayload';
import type { SimulationTimePayload } from './interfaces/SimulationTimePayload';
import { PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { DEFAULT_SIMULATION_SPEED } from './simulation.speed.constants';
import type { SimulationSpeed } from './simulation.speed.constants';
import { ToolpathFailed, ToolpathReady, ToolpathRequested } from './toolpath.state';

// #region State
export interface SimulationState {
  /** Second of the estimated job time shown, from 0. */
  currentTimeS: number;
  /** Whether the playback advances the time. */
  isPlaying: boolean;
  /** Seconds of job time per real second while playing. */
  speed: SimulationSpeed;
}
// #endregion

// #region State name
export const SIMULATION_STATE_NAME = 'simulation';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(SIMULATION_STATE_NAME);
// #endregion

// #region Actions
export class SimulationTimeSet extends Action<SimulationTimePayload> {
  public static readonly type: string = actionType('simulation time set');
}

export class SimulationPlayToggled extends Action {
  public static readonly type: string = actionType('simulation play toggled');
}

export class SimulationPaused extends Action {
  public static readonly type: string = actionType('simulation paused');
}

export class SimulationSpeedSet extends Action<SimulationSpeedPayload> {
  public static readonly type: string = actionType('simulation speed set');
}

export class SimulationReset extends Action {
  public static readonly type: string = actionType('simulation reset');
}
// #endregion

// #region Initial state
const INITIAL_SIMULATION_STATE: SimulationState = {
  currentTimeS: 0,
  isPlaying: false,
  speed: DEFAULT_SIMULATION_SPEED,
};

/** Actions after which the shown toolpath is new or no longer current. */
const SIMULATION_RESET_ACTION_TYPES: readonly string[] = [
  SimulationReset.type,
  ToolpathRequested.type,
  ToolpathReady.type,
  ToolpathFailed.type,
  ...PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES,
];
// #endregion

// #region Reducer
const getStateAtStart = (state: SimulationState): SimulationState => ({ ...state, currentTimeS: 0, isPlaying: false });

export const simulationReducer = (
  state: SimulationState = INITIAL_SIMULATION_STATE,
  action: Action<unknown>,
): SimulationState => {
  switch (action.type) {
  case SimulationTimeSet.type:
    return { ...state, currentTimeS: Math.max((action as SimulationTimeSet).payload.timeS, 0) };
  case SimulationPlayToggled.type:
    return { ...state, isPlaying: !state.isPlaying };
  case SimulationPaused.type:
    return state.isPlaying ? { ...state, isPlaying: false } : state;
  case SimulationSpeedSet.type:
    return { ...state, speed: (action as SimulationSpeedSet).payload.speed };
  default:
    return SIMULATION_RESET_ACTION_TYPES.includes(action.type) ? getStateAtStart(state) : state;
  }
};
// #endregion

// #region Selectors
type RootState = { [SIMULATION_STATE_NAME]: SimulationState };

export const selectSimulationTimeS = (state: RootState): number => state[SIMULATION_STATE_NAME].currentTimeS;

export const selectIsSimulationPlaying = (state: RootState): boolean => state[SIMULATION_STATE_NAME].isPlaying;

export const selectSimulationSpeed = (state: RootState): SimulationSpeed => state[SIMULATION_STATE_NAME].speed;
// #endregion
