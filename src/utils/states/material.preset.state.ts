/**
 * The saved material presets, in their own state. It starts empty and is filled once storage has been read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialPreset } from '../materials/interfaces/MaterialPreset';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { MaterialPresetDeletedPayload } from './interfaces/MaterialPresetDeletedPayload';
import type { MaterialPresetPayload } from './interfaces/MaterialPresetPayload';
import type { MaterialPresetsPayload } from './interfaces/MaterialPresetsPayload';
import { MachineProfileDeleted } from './machine.profile.state';

// #region State
export interface MaterialPresetState {
  /** Every known preset, of every machine profile. */
  presets: MaterialPreset[];
}
// #endregion

// #region State name
export const MATERIAL_PRESET_STATE_NAME = 'materialPreset';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(MATERIAL_PRESET_STATE_NAME);
// #endregion

// #region Actions
export class MaterialPresetsLoaded extends Action<MaterialPresetsPayload> {
  public static readonly type: string = actionType('material presets loaded');
}

export class MaterialPresetSaved extends Action<MaterialPresetPayload> {
  public static readonly type: string = actionType('material preset saved');
}

export class MaterialPresetDeleted extends Action<MaterialPresetDeletedPayload> {
  public static readonly type: string = actionType('material preset deleted');
}
// #endregion

// #region Initial state
const INITIAL_MATERIAL_PRESET_STATE: MaterialPresetState = { presets: [] };
// #endregion

// #region Reducer
const getPresetsWithSavedPreset = (presets: MaterialPreset[], savedPreset: MaterialPreset): MaterialPreset[] =>
  presets.some(({ id }: MaterialPreset): boolean => id === savedPreset.id)
    ? presets.map((preset: MaterialPreset): MaterialPreset => preset.id === savedPreset.id ? savedPreset : preset)
    : [...presets, savedPreset];

export const materialPresetReducer = (
  state: MaterialPresetState = INITIAL_MATERIAL_PRESET_STATE,
  action: Action<unknown>,
): MaterialPresetState => {
  switch (action.type) {
  case MaterialPresetsLoaded.type:
    return { ...state, presets: (action as MaterialPresetsLoaded).payload.presets };
  case MaterialPresetSaved.type:
    return {
      ...state,
      presets: getPresetsWithSavedPreset(state.presets, (action as MaterialPresetSaved).payload.preset),
    };
  case MaterialPresetDeleted.type:
    return {
      ...state,
      presets: state.presets.filter(
        ({ id }: MaterialPreset): boolean => id !== (action as MaterialPresetDeleted).payload.presetId,
      ),
    };
  case MachineProfileDeleted.type:
    return {
      ...state,
      presets: state.presets.filter(
        ({ machineProfileId }: MaterialPreset): boolean =>
          machineProfileId !== (action as MachineProfileDeleted).payload.profileId,
      ),
    };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [MATERIAL_PRESET_STATE_NAME]: MaterialPresetState };

export const selectMaterialPresets = (state: RootState): MaterialPreset[] => state[MATERIAL_PRESET_STATE_NAME].presets;
// #endregion
