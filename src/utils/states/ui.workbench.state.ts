/**
 * Workbench UI choices that must outlive a component: the wide and the narrow layout mount their panels anew, and a
 * control in one panel can open something that lives in another.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import { WORKBENCH_REGION } from './workbench.region.constants';
import type { WorkbenchRegion } from './workbench.region.constants';

// #region State
export interface UiWorkbenchState {
  /** The region shown in a narrow window. */
  narrowRegion: WorkbenchRegion;
  /** Whether the frame settings under the Frame button are open. */
  isFrameSettingsOpen: boolean;
  /** Whether the laser profiles dialog is open; the top bar and the Job card both open it. */
  isMachineProfilesDialogOpen: boolean;
  /** The key of the layer whose settings drawer is open; the layer row and the 3D Cut check both open it. */
  openLayerSettingsKey?: string;
}
// #endregion

// #region State name
export const UI_WORKBENCH_STATE_NAME = 'uiWorkbench';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(UI_WORKBENCH_STATE_NAME);
// #endregion

// #region Actions
export class NarrowRegionChanged extends Action<Pick<UiWorkbenchState, 'narrowRegion'>> {
  public static readonly type: string = actionType('narrow region changed');
}

export class FrameSettingsOpenChanged extends Action<Pick<UiWorkbenchState, 'isFrameSettingsOpen'>> {
  public static readonly type: string = actionType('frame settings open changed');
}

export class MachineProfilesDialogOpenChanged extends Action<Pick<UiWorkbenchState, 'isMachineProfilesDialogOpen'>> {
  public static readonly type: string = actionType('machine profiles dialog open changed');
}
export class LayerSettingsOpenChanged extends Action<Pick<UiWorkbenchState, 'openLayerSettingsKey'>> {
  public static readonly type: string = actionType('layer settings open changed');
}
// #endregion

// #region Initial state
const INITIAL_UI_WORKBENCH_STATE: UiWorkbenchState = {
  narrowRegion: WORKBENCH_REGION.BED,
  isFrameSettingsOpen: false,
  isMachineProfilesDialogOpen: false,
};
// #endregion

// #region Reducer
export const uiWorkbenchReducer = (
  state: UiWorkbenchState = INITIAL_UI_WORKBENCH_STATE,
  action: Action<unknown>,
): UiWorkbenchState => {
  switch (action.type) {
  case NarrowRegionChanged.type:
  case FrameSettingsOpenChanged.type:
  case MachineProfilesDialogOpenChanged.type:
  case LayerSettingsOpenChanged.type:
    return { ...state, ...(action as Action<Partial<UiWorkbenchState>>).payload };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [UI_WORKBENCH_STATE_NAME]: UiWorkbenchState };

export const selectNarrowRegion = (state: RootState): WorkbenchRegion => state[UI_WORKBENCH_STATE_NAME].narrowRegion;

export const selectIsFrameSettingsOpen = (state: RootState): boolean =>
  state[UI_WORKBENCH_STATE_NAME].isFrameSettingsOpen;

export const selectIsMachineProfilesDialogOpen = (state: RootState): boolean =>
  state[UI_WORKBENCH_STATE_NAME].isMachineProfilesDialogOpen;
export const selectOpenLayerSettingsKey = (state: RootState): string | undefined =>
  state[UI_WORKBENCH_STATE_NAME].openLayerSettingsKey;
// #endregion
