/**
 * Whether a drag or handle gesture on the bed is under way. The gesture commits its offset onto the document as it
 * is when the pointer comes up, so the undo and redo hotkeys wait while it runs instead of changing the document
 * under it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { BedGestureActivityPayload } from './interfaces/BedGestureActivityPayload';

// #region State
export interface BedGestureState {
  /** True while a pointer drags objects or a handle on the bed. */
  isBedGestureActive: boolean;
}
// #endregion

// #region State name
export const BED_GESTURE_STATE_NAME = 'bedGesture';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(BED_GESTURE_STATE_NAME);
// #endregion

// #region Actions
export class BedGestureActivityChanged extends Action<BedGestureActivityPayload> {
  public static readonly type: string = actionType('bed gesture activity changed');
}
// #endregion

// #region Initial state
const INITIAL_BED_GESTURE_STATE: BedGestureState = {
  isBedGestureActive: false,
};
// #endregion

// #region Reducer
export const bedGestureReducer = (
  state: BedGestureState = INITIAL_BED_GESTURE_STATE,
  action: Action<unknown>,
): BedGestureState => {
  switch (action.type) {
  case BedGestureActivityChanged.type:
    return { isBedGestureActive: (action as BedGestureActivityChanged).payload.isBedGestureActive };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [BED_GESTURE_STATE_NAME]: BedGestureState };

export const selectIsBedGestureActive = (state: RootState): boolean => state[BED_GESTURE_STATE_NAME].isBedGestureActive;
// #endregion
