/**
 * App-wide preferences that are not about the bed: whether Escape also stops the laser while a drawer, dialog or
 * popover is open. It starts off and is replaced by the stored choice once that has been read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { EscStopPreferencePayload } from './interfaces/EscStopPreferencePayload';

// #region State
export interface AppPreferencesState {
  /** True when Escape also stops the laser while an overlay is open; off by default. */
  isEscStoppingWithOverlayOpen: boolean;
}
// #endregion

// #region State name
export const APP_PREFERENCES_STATE_NAME = 'appPreferences';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(APP_PREFERENCES_STATE_NAME);
// #endregion

// #region Actions
export class EscStopPreferenceLoaded extends Action<EscStopPreferencePayload> {
  public static readonly type: string = actionType('esc stop preference loaded');
}

export class EscStopPreferenceChanged extends Action<EscStopPreferencePayload> {
  public static readonly type: string = actionType('esc stop preference changed');
}
// #endregion

// #region Initial state
export const DEFAULT_ESC_STOPS_WITH_OVERLAY_OPEN = false;

const INITIAL_APP_PREFERENCES_STATE: AppPreferencesState = {
  isEscStoppingWithOverlayOpen: DEFAULT_ESC_STOPS_WITH_OVERLAY_OPEN,
};
// #endregion

// #region Reducer
export const appPreferencesReducer = (
  state: AppPreferencesState = INITIAL_APP_PREFERENCES_STATE,
  action: Action<unknown>,
): AppPreferencesState => {
  switch (action.type) {
  case EscStopPreferenceLoaded.type:
  case EscStopPreferenceChanged.type:
    return {
      ...state,
      isEscStoppingWithOverlayOpen: (action as EscStopPreferenceChanged).payload.isEscStoppingWithOverlayOpen,
    };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [APP_PREFERENCES_STATE_NAME]: AppPreferencesState };

export const selectIsEscStoppingWithOverlayOpen = (state: RootState): boolean =>
  state[APP_PREFERENCES_STATE_NAME].isEscStoppingWithOverlayOpen;
// #endregion
