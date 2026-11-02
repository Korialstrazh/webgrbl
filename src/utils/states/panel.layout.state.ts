/**
 * The workbench panel layout: the panel sizes the user set with the splitters, whether they have been read from
 * storage yet, and whether the console panel is open. The wide workbench waits for that read, so it opens with the
 * stored sizes instead of jumping to them.
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
import type { ConsoleOpenPayload } from './interfaces/ConsoleOpenPayload';
import type { ConsoleSizePercentPayload } from './interfaces/ConsoleSizePercentPayload';
import type { PanelSizePercentsPayload } from './interfaces/PanelSizePercentsPayload';
import type { StoredPanelSizesPayload } from './interfaces/StoredPanelSizesPayload';

// #region State
export interface PanelLayoutState {
  /** Width of each panel, left to right, in percent of the workbench width; undefined while the defaults apply. */
  panelSizePercents: number[] | undefined;
  /** The console height in percent of the bed column; undefined while the default height applies. */
  consoleSizePercent: number | undefined;
  /** Whether the stored sizes have been read, or the read failed or took too long and the defaults apply. */
  isPanelLayoutLoaded: boolean;
  /** Whether the console panel is shown below the bed; it starts closed and is not stored. */
  isConsoleOpen: boolean;
}
// #endregion

// #region State name
export const PANEL_LAYOUT_STATE_NAME = 'panelLayout';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(PANEL_LAYOUT_STATE_NAME);
// #endregion

// #region Actions
export class PanelSizesLoaded extends Action<StoredPanelSizesPayload> {
  public static readonly type: string = actionType('panel sizes loaded');
}

export class PanelSizesResized extends Action<PanelSizePercentsPayload> {
  public static readonly type: string = actionType('panel sizes resized');
}

export class ConsoleSizeResized extends Action<ConsoleSizePercentPayload> {
  public static readonly type: string = actionType('console size resized');
}

export class ConsoleOpenChanged extends Action<ConsoleOpenPayload> {
  public static readonly type: string = actionType('console open changed');
}
// #endregion

// #region Initial state
const INITIAL_PANEL_LAYOUT_STATE: PanelLayoutState = {
  panelSizePercents: undefined,
  consoleSizePercent: undefined,
  isPanelLayoutLoaded: false,
  isConsoleOpen: false,
};
// #endregion

// #region Reducer
export const panelLayoutReducer = (
  state: PanelLayoutState = INITIAL_PANEL_LAYOUT_STATE,
  action: Action<unknown>,
): PanelLayoutState => {
  switch (action.type) {
  case PanelSizesLoaded.type:
    return { ...state, ...(action as PanelSizesLoaded).payload, isPanelLayoutLoaded: true };
  case PanelSizesResized.type:
    return { ...state, panelSizePercents: (action as PanelSizesResized).payload.panelSizePercents };
  case ConsoleSizeResized.type:
    return { ...state, consoleSizePercent: (action as ConsoleSizeResized).payload.consoleSizePercent };
  case ConsoleOpenChanged.type:
    return { ...state, isConsoleOpen: (action as ConsoleOpenChanged).payload.isConsoleOpen };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [PANEL_LAYOUT_STATE_NAME]: PanelLayoutState };

export const selectPanelSizePercents = (state: RootState): number[] | undefined =>
  state[PANEL_LAYOUT_STATE_NAME].panelSizePercents;

export const selectIsPanelLayoutLoaded = (state: RootState): boolean =>
  state[PANEL_LAYOUT_STATE_NAME].isPanelLayoutLoaded;

export const selectConsoleSizePercent = (state: RootState): number | undefined =>
  state[PANEL_LAYOUT_STATE_NAME].consoleSizePercent;

export const selectIsConsoleOpen = (state: RootState): boolean => state[PANEL_LAYOUT_STATE_NAME].isConsoleOpen;
// #endregion
