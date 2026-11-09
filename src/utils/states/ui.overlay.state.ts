/**
 * Which overlays (popovers, dialogs, drawers) are open, so the Escape-to-STOP hotkey can tell the main view
 * from an overlay, and whether the connection popover is open, so more than the top-bar pill can open it.
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
import type { ConnectionPopoverOpenPayload } from './interfaces/ConnectionPopoverOpenPayload';
import type { OverlayRegistryPayload } from './interfaces/OverlayRegistryPayload';
import { OVERLAY_KIND } from './overlay.kind.constants';

// #region State
export interface UiOverlayState {
  /** Ids of the open overlays, in the order they opened. */
  openOverlayIds: string[];
  /** Whether the connection popover under the top-bar pill is open; the pill and the Status card both open it. */
  isConnectionPopoverOpen: boolean;
  /** How many times a dialog or drawer has opened; each rise closes the open popovers. */
  dialogOpenCount: number;
  /** Ids of the open dialogs and drawers; while any is open, only STOP of the narrow stop bar stays usable. */
  openDialogIds: string[];
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

export class ConnectionPopoverOpenChanged extends Action<ConnectionPopoverOpenPayload> {
  public static readonly type: string = actionType('connection popover open changed');
}
// #endregion

// #region Initial state
const INITIAL_UI_OVERLAY_STATE: UiOverlayState = {
  openOverlayIds: [],
  isConnectionPopoverOpen: false,
  dialogOpenCount: 0,
  openDialogIds: [],
};
// #endregion

// #region Reducer
const getStateWithOverlay = (
  state: UiOverlayState,
  { overlayId, overlayKind }: OverlayRegistryPayload,
): UiOverlayState => {
  if (state.openOverlayIds.includes(overlayId)) {
    return state;
  }

  const stateWithOverlay: UiOverlayState = { ...state, openOverlayIds: [...state.openOverlayIds, overlayId] };

  return overlayKind === OVERLAY_KIND.DIALOG
    ? {
      ...stateWithOverlay,
      isConnectionPopoverOpen: false,
      dialogOpenCount: state.dialogOpenCount + 1,
      openDialogIds: [...state.openDialogIds, overlayId],
    }
    : stateWithOverlay;
};

const getStateWithoutOverlay = (state: UiOverlayState, overlayId: string): UiOverlayState =>
  state.openOverlayIds.includes(overlayId)
    ? {
      ...state,
      openOverlayIds: state.openOverlayIds.filter((openOverlayId: string) => openOverlayId !== overlayId),
      openDialogIds: state.openDialogIds.filter((openDialogId: string) => openDialogId !== overlayId),
    }
    : state;

export const uiOverlayReducer = (
  state: UiOverlayState = INITIAL_UI_OVERLAY_STATE,
  action: Action<unknown>,
): UiOverlayState => {
  switch (action.type) {
  case OverlayOpened.type:
    return getStateWithOverlay(state, (action as OverlayOpened).payload);
  case OverlayClosed.type:
    return getStateWithoutOverlay(state, (action as OverlayClosed).payload.overlayId);
  case ConnectionPopoverOpenChanged.type:
    return {
      ...state,
      isConnectionPopoverOpen: (action as ConnectionPopoverOpenChanged).payload.isConnectionPopoverOpen,
    };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [UI_OVERLAY_STATE_NAME]: UiOverlayState };

export const selectIsAnyOverlayOpen = (state: RootState): boolean =>
  !!state[UI_OVERLAY_STATE_NAME].openOverlayIds.length;

export const selectTopOverlayId = (state: RootState): string | undefined =>
  state[UI_OVERLAY_STATE_NAME].openOverlayIds.at(-1);

export const selectIsConnectionPopoverOpen = (state: RootState): boolean =>
  state[UI_OVERLAY_STATE_NAME].isConnectionPopoverOpen;

export const selectIsAnyDialogOpen = (state: RootState): boolean =>
  !!state[UI_OVERLAY_STATE_NAME].openDialogIds.length;

export const selectDialogOpenCount = (state: RootState): number => state[UI_OVERLAY_STATE_NAME].dialogOpenCount;
// #endregion
