/**
 * Which overlays (popovers, dialogs, drawers) are open, so the Escape-to-STOP hotkey can tell the main view
 * from an overlay.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { OverlayRegistryPayload } from './interfaces/OverlayRegistryPayload';

// #region State
export interface UiOverlayState {
  /** Ids of the open overlays, in the order they opened. */
  openOverlayIds: string[];
}
// #endregion

// #region State name
export const UI_OVERLAY_STATE_NAME = 'uiOverlay';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(UI_OVERLAY_STATE_NAME);
// #endregion

// #region Actions
export class OverlayOpened extends Action<OverlayRegistryPayload> {
  public static readonly type: string = actionType('overlay opened');
}

export class OverlayClosed extends Action<OverlayRegistryPayload> {
  public static readonly type: string = actionType('overlay closed');
}
// #endregion

// #region Initial state
const INITIAL_UI_OVERLAY_STATE: UiOverlayState = {
  openOverlayIds: [],
};
// #endregion

// #region Reducer
const getStateWithOverlay = (state: UiOverlayState, overlayId: string): UiOverlayState =>
  state.openOverlayIds.includes(overlayId)
    ? state
    : { openOverlayIds: [...state.openOverlayIds, overlayId] };

const getStateWithoutOverlay = (state: UiOverlayState, overlayId: string): UiOverlayState =>
  state.openOverlayIds.includes(overlayId)
    ? { openOverlayIds: state.openOverlayIds.filter((openOverlayId: string) => openOverlayId !== overlayId) }
    : state;

export const uiOverlayReducer = (
  state: UiOverlayState = INITIAL_UI_OVERLAY_STATE,
  action: Action<unknown>,
): UiOverlayState => {
  switch (action.type) {
  case OverlayOpened.type:
    return getStateWithOverlay(state, (action as OverlayOpened).payload.overlayId);
  case OverlayClosed.type:
    return getStateWithoutOverlay(state, (action as OverlayClosed).payload.overlayId);
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [UI_OVERLAY_STATE_NAME]: UiOverlayState };

export const selectIsAnyOverlayOpen = (state: RootState): boolean =>
  !!state[UI_OVERLAY_STATE_NAME].openOverlayIds.length;
// #endregion
