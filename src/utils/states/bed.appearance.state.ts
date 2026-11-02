/**
 * How the bed looks: the colour the user chose for the work surface, app-wide. It starts at the default and is replaced
 * by the stored colour once that has been read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT_BED_COLOUR } from '../bed/bed.colour.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { BedColourPayload } from './interfaces/BedColourPayload';

// #region State
export interface BedAppearanceState {
  /** The bed work surface colour, a six-digit hex colour. */
  bedColour: string;
}
// #endregion

// #region State name
export const BED_APPEARANCE_STATE_NAME = 'bedAppearance';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(BED_APPEARANCE_STATE_NAME);
// #endregion

// #region Actions
export class BedColourLoaded extends Action<BedColourPayload> {
  public static readonly type: string = actionType('bed colour loaded');
}

export class BedColourChanged extends Action<BedColourPayload> {
  public static readonly type: string = actionType('bed colour changed');
}
// #endregion

// #region Initial state
const INITIAL_BED_APPEARANCE_STATE: BedAppearanceState = {
  bedColour: DEFAULT_BED_COLOUR,
};
// #endregion

// #region Reducer
export const bedAppearanceReducer = (
  state: BedAppearanceState = INITIAL_BED_APPEARANCE_STATE,
  action: Action<unknown>,
): BedAppearanceState => {
  switch (action.type) {
  case BedColourLoaded.type:
  case BedColourChanged.type:
    return { ...state, bedColour: (action as BedColourChanged).payload.bedColour };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [BED_APPEARANCE_STATE_NAME]: BedAppearanceState };

export const selectBedColour = (state: RootState): string => state[BED_APPEARANCE_STATE_NAME].bedColour;
// #endregion
