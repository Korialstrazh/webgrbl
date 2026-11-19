/**
 * What the bed shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BED_VIEW_MODE } from '../bed/bed.view.constants';
import type { BedViewMode } from '../bed/bed.view.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { BedViewModeChangedPayload } from './interfaces/BedViewModeChangedPayload';

// #region State
export interface BedViewState {
  /** What the bed shows. */
  viewMode: BedViewMode;
  /** Counts requests to zoom the bed to the selection; the bed view reacts to each change. */
  selectionFitRequestCount: number;
}
// #endregion

// #region State name
export const BED_VIEW_STATE_NAME = 'bedView';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(BED_VIEW_STATE_NAME);
// #endregion

// #region Actions
export class BedViewModeChanged extends Action<BedViewModeChangedPayload> {
  public static readonly type: string = actionType('bed view mode changed');
}

export class BedSelectionFitRequested extends Action<void> {
  public static readonly type: string = actionType('bed selection fit requested');
}
// #endregion

// #region Initial state
const INITIAL_BED_VIEW_STATE: BedViewState = { viewMode: BED_VIEW_MODE.DESIGN, selectionFitRequestCount: 0 };
// #endregion

// #region Reducer
export const bedViewReducer = (state: BedViewState = INITIAL_BED_VIEW_STATE, action: Action<unknown>): BedViewState => {
  switch (action.type) {
  case BedViewModeChanged.type:
    return { ...state, viewMode: (action as BedViewModeChanged).payload.viewMode };
  case BedSelectionFitRequested.type:
    return { ...state, selectionFitRequestCount: state.selectionFitRequestCount + 1 };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [BED_VIEW_STATE_NAME]: BedViewState };

export const selectBedViewMode = (state: RootState): BedViewMode => state[BED_VIEW_STATE_NAME].viewMode;

export const selectBedSelectionFitRequestCount = (state: RootState): number =>
  state[BED_VIEW_STATE_NAME].selectionFitRequestCount;
// #endregion
