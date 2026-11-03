/**
 * The materials the user burns on, with their test results. It starts empty and is filled once storage has been read.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getMaterialWithTestResult } from '../materials/get.material.with.test.result';
import type { Material } from '../materials/interfaces/Material';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { MaterialPayload } from './interfaces/MaterialPayload';
import type { MaterialTestResultSavedPayload } from './interfaces/MaterialTestResultSavedPayload';
import type { MaterialsPayload } from './interfaces/MaterialsPayload';

// #region State
export interface MaterialState {
  /** Every known material, as stored. */
  materials: Material[];
}
// #endregion

// #region State name
export const MATERIAL_STATE_NAME = 'material';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(MATERIAL_STATE_NAME);
// #endregion

// #region Actions
export class MaterialsLoaded extends Action<MaterialsPayload> {
  public static readonly type: string = actionType('materials loaded');
}

export class MaterialSaved extends Action<MaterialPayload> {
  public static readonly type: string = actionType('material saved');
}

export class MaterialTestResultSaved extends Action<MaterialTestResultSavedPayload> {
  public static readonly type: string = actionType('material test result saved');
}
// #endregion

// #region Initial state
const INITIAL_MATERIAL_STATE: MaterialState = { materials: [] };
// #endregion

// #region Reducer
const getMaterialsWithSavedMaterial = (materials: Material[], savedMaterial: Material): Material[] =>
  materials.some((material: Material): boolean => material.id === savedMaterial.id)
    ? materials.map((material: Material): Material => material.id === savedMaterial.id ? savedMaterial : material)
    : [...materials, savedMaterial];

const getMaterialsWithTestResult = (
  materials: Material[],
  { materialId, testResult }: MaterialTestResultSavedPayload,
): Material[] =>
  materials.map((material: Material): Material =>
    material.id === materialId ? getMaterialWithTestResult(material, testResult) : material);

export const materialReducer = (
  state: MaterialState = INITIAL_MATERIAL_STATE,
  action: Action<unknown>,
): MaterialState => {
  switch (action.type) {
  case MaterialsLoaded.type:
    return { ...state, materials: (action as MaterialsLoaded).payload.materials };
  case MaterialSaved.type:
    return {
      ...state,
      materials: getMaterialsWithSavedMaterial(state.materials, (action as MaterialSaved).payload.material),
    };
  case MaterialTestResultSaved.type:
    return {
      ...state,
      materials: getMaterialsWithTestResult(state.materials, (action as MaterialTestResultSaved).payload),
    };
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [MATERIAL_STATE_NAME]: MaterialState };

export const selectMaterials = (state: RootState): Material[] => state[MATERIAL_STATE_NAME].materials;
// #endregion
