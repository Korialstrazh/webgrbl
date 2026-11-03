/**
 * What the bed shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
// #endregion

// #region Initial state
const INITIAL_BED_VIEW_STATE: BedViewState = { viewMode: BED_VIEW_MODE.DESIGN };
// #endregion

// #region Reducer
export const bedViewReducer = (state: BedViewState = INITIAL_BED_VIEW_STATE, action: Action<unknown>): BedViewState =>
  (action.type === BedViewModeChanged.type ? { viewMode: (action as BedViewModeChanged).payload.viewMode } : state);
// #endregion

// #region Selectors
type RootState = { [BED_VIEW_STATE_NAME]: BedViewState };

export const selectBedViewMode = (state: RootState): BedViewMode => state[BED_VIEW_STATE_NAME].viewMode;
// #endregion
