/**
 * The low-power laser pointer the user holds to fire: whether it is firing and at what power. The laser pointer saga
 * owns the firing; the UI only requests fire and release.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getClampedPointerPowerPercent } from '../machine/get.clamped.pointer.power.percent';
import { DEFAULT_POINTER_POWER_PERCENT } from '../machine/machine.command.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { LaserPointerPowerPayload } from './interfaces/LaserPointerPowerPayload';

// #region State
export interface LaserPointerState {
  /** True from the pointer-on lines until the pointer-off line or the loss of the connection. */
  isFiring: boolean;
  /** Pointer power in percent of the laser's S max, always inside the allowed pointer range. */
  powerPercent: number;
}
// #endregion

// #region State name
export const LASER_POINTER_STATE_NAME = 'laserPointer';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(LASER_POINTER_STATE_NAME);
// #endregion

// #region Actions
export class LaserPointerPowerChanged extends Action<LaserPointerPowerPayload> {
  public static readonly type: string = actionType('laser pointer power changed');
}

export class LaserPointerFireRequested extends Action {
  public static readonly type: string = actionType('laser pointer fire requested');
}

export class LaserPointerReleaseRequested extends Action {
  public static readonly type: string = actionType('laser pointer release requested');
}

export class LaserPointerFiringStarted extends Action {
  public static readonly type: string = actionType('laser pointer firing started');
}

export class LaserPointerFiringStopped extends Action {
  public static readonly type: string = actionType('laser pointer firing stopped');
}
// #endregion

// #region Initial state
const INITIAL_LASER_POINTER_STATE: LaserPointerState = {
  isFiring: false,
  powerPercent: DEFAULT_POINTER_POWER_PERCENT,
};
// #endregion

// #region Reducer
export const laserPointerReducer = (
  state: LaserPointerState = INITIAL_LASER_POINTER_STATE,
  action: Action<unknown>,
): LaserPointerState => {
  switch (action.type) {
  case LaserPointerPowerChanged.type:
    return {
      ...state,
      powerPercent: getClampedPointerPowerPercent((action as LaserPointerPowerChanged).payload.percent),
    };
  case LaserPointerFiringStarted.type:
    return { ...state, isFiring: true };
  case LaserPointerFiringStopped.type:
    return { ...state, isFiring: false };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [LASER_POINTER_STATE_NAME]: LaserPointerState };

export const selectIsLaserPointerFiring = (state: RootState): boolean => state[LASER_POINTER_STATE_NAME].isFiring;

export const selectLaserPointerPowerPercent = (state: RootState): number =>
  state[LASER_POINTER_STATE_NAME].powerPercent;
// #endregion
