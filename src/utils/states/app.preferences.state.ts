/**
 * App-wide preferences: whether Escape also stops the laser while a drawer, dialog or popover is open, and whether a
 * double-click on empty bed moves the laser there, and whether the viewer folded the Job card. All start off and are
 * replaced by the stored choices once those have been read.
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
import type { BedDoubleClickMovePreferencePayload } from './interfaces/BedDoubleClickMovePreferencePayload';
import type { EscStopPreferencePayload } from './interfaces/EscStopPreferencePayload';
import type { JobCardCollapsePreferencePayload } from './interfaces/JobCardCollapsePreferencePayload';

// #region State
export interface AppPreferencesState {
  /** True when Escape also stops the laser while an overlay is open; off by default. */
  isEscStoppingWithOverlayOpen: boolean;
  /** True when a double-click on empty bed moves the laser there; off by default. */
  isBedDoubleClickMovingLaser: boolean;
  /** True when the Job card shows only its one-line summary with Start; open by default. */
  isJobCardCollapsed: boolean;
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

export class BedDoubleClickMovePreferenceLoaded extends Action<BedDoubleClickMovePreferencePayload> {
  public static readonly type: string = actionType('bed double click move preference loaded');
}

export class BedDoubleClickMovePreferenceChanged extends Action<BedDoubleClickMovePreferencePayload> {
  public static readonly type: string = actionType('bed double click move preference changed');
}

export class JobCardCollapsePreferenceLoaded extends Action<JobCardCollapsePreferencePayload> {
  public static readonly type: string = actionType('job card collapse preference loaded');
}

export class JobCardCollapsePreferenceChanged extends Action<JobCardCollapsePreferencePayload> {
  public static readonly type: string = actionType('job card collapse preference changed');
}
// #endregion

// #region Initial state
export const DEFAULT_ESC_STOPS_WITH_OVERLAY_OPEN = false;
export const DEFAULT_BED_DOUBLE_CLICK_MOVES_LASER = false;
export const DEFAULT_JOB_CARD_COLLAPSED = false;

const INITIAL_APP_PREFERENCES_STATE: AppPreferencesState = {
  isEscStoppingWithOverlayOpen: DEFAULT_ESC_STOPS_WITH_OVERLAY_OPEN,
  isBedDoubleClickMovingLaser: DEFAULT_BED_DOUBLE_CLICK_MOVES_LASER,
  isJobCardCollapsed: DEFAULT_JOB_CARD_COLLAPSED,
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
  case BedDoubleClickMovePreferenceLoaded.type:
  case BedDoubleClickMovePreferenceChanged.type:
    return {
      ...state,
      isBedDoubleClickMovingLaser: (action as BedDoubleClickMovePreferenceChanged).payload.isBedDoubleClickMovingLaser,
    };
  case JobCardCollapsePreferenceLoaded.type:
  case JobCardCollapsePreferenceChanged.type:
    return {
      ...state,
      isJobCardCollapsed: (action as JobCardCollapsePreferenceChanged).payload.isJobCardCollapsed,
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

export const selectIsBedDoubleClickMovingLaser = (state: RootState): boolean =>
  state[APP_PREFERENCES_STATE_NAME].isBedDoubleClickMovingLaser;

export const selectIsJobCardCollapsed = (state: RootState): boolean =>
  state[APP_PREFERENCES_STATE_NAME].isJobCardCollapsed;
// #endregion
