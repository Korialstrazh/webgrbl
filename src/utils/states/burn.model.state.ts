/**
 * The burn model of the open project, the part selected in the 3D preview, and how far each part is lifted. Lifting
 * changes nothing in the project. Anything the model is made from going out of date makes a ready model stale. A
 * running build is cancelled by the saga at those same moments, so it stops counting as building.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { createSelector } from '@reduxjs/toolkit';
import { getBurnPartEffectiveLiftMm } from '../burn.model/get.burn.part.effective.lift.mm';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnPart } from '../burn.model/interfaces/BurnPart';
import type { BurnPartLiftsMm } from '../burn.model/interfaces/BurnPartLiftsMm';
import { isBurnPartLiftable } from '../burn.model/is.burn.part.liftable';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import { BedViewModeChanged } from './bed.view.state';
import { BURN_MODEL_STATUS } from './burn.model.status.constants';
import type { BurnModelStatus } from './burn.model.status.constants';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { BurnModelReadyPayload } from './interfaces/BurnModelReadyPayload';
import type { BurnModelRequestedPayload } from './interfaces/BurnModelRequestedPayload';
import type { BurnPartHoveredPayload } from './interfaces/BurnPartHoveredPayload';
import type { BurnPartLiftedPayload } from './interfaces/BurnPartLiftedPayload';
import type { BurnPartSelectedPayload } from './interfaces/BurnPartSelectedPayload';
import { ActiveMachineProfileSelected } from './machine.profile.state';
import { MaterialSaved, MaterialTestResultSaved } from './material.state';
import { PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { ProjectMaterialSelected } from './project.document.state';
import { ToolpathMachineAreaChanged, ToolpathRequested } from './toolpath.state';

// #region State
export interface BurnModelState {
  /** Where the model stands. */
  status: BurnModelStatus;
  /** The latest model, kept while it is stale or rebuilt; undefined before the first result. */
  model: BurnModel | undefined;
  /** The part selected in the 3D preview. */
  selectedPartId: number | undefined;
  /** The material of the latest build; undefined before the first one. */
  builtMaterialId: string | undefined;
  /** How far the user lifted each part above its place, in mm, not counting what lifts its parents. */
  liftMmByPartId: BurnPartLiftsMm;
  /** The part under the pointer in the scene, or under it in the part list. */
  hoveredPartId: number | undefined;
}
// #endregion

// #region State name
export const BURN_MODEL_STATE_NAME = 'burnModel';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(BURN_MODEL_STATE_NAME);
// #endregion

// #region Actions
export class BurnModelRequested extends Action<BurnModelRequestedPayload> {
  public static readonly type: string = actionType('burn model requested');
}

export class BurnModelReady extends Action<BurnModelReadyPayload> {
  public static readonly type: string = actionType('burn model ready');
}

export class BurnModelFailed extends Action {
  public static readonly type: string = actionType('burn model failed');
}

export class BurnPartSelected extends Action<BurnPartSelectedPayload> {
  public static readonly type: string = actionType('burn part selected');
}

export class BurnPartLifted extends Action<BurnPartLiftedPayload> {
  public static readonly type: string = actionType('burn part lifted');
}

export class BurnPartHovered extends Action<BurnPartHoveredPayload> {
  public static readonly type: string = actionType('burn part hovered');
}

export class BurnPartLiftsReset extends Action {
  public static readonly type: string = actionType('burn part lifts reset');
}
// #endregion

// #region Initial state
const INITIAL_BURN_MODEL_STATE: BurnModelState = {
  status: BURN_MODEL_STATUS.IDLE,
  model: undefined,
  selectedPartId: undefined,
  builtMaterialId: undefined,
  liftMmByPartId: {},
  hoveredPartId: undefined,
};

// The machine feeds the model without changing the toolpath. The material actions are not here: only those that touch
// the material of the model count, see the reducer.
const BURN_MODEL_INPUT_CHANGE_ACTION_TYPES: readonly string[] = [
  ...PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES,
  ToolpathRequested.type,
  ToolpathMachineAreaChanged.type,
  ActiveMachineProfileSelected.type,
];
// #endregion

// #region Reducer
const getStateAfterBuildStopped = (state: BurnModelState): BurnModelState => {
  if (state.status !== BURN_MODEL_STATUS.BUILDING) {
    return state;
  }

  return { ...state, status: state.model ? BURN_MODEL_STATUS.STALE : BURN_MODEL_STATUS.IDLE };
};

const getStateAfterInputChange = (state: BurnModelState): BurnModelState =>
  (state.status === BURN_MODEL_STATUS.READY
    ? { ...state, status: BURN_MODEL_STATUS.STALE }
    : getStateAfterBuildStopped(state));

const getStateAfterMaterialChange = (state: BurnModelState, changedMaterialId: string): BurnModelState =>
  (changedMaterialId === state.builtMaterialId ? getStateAfterInputChange(state) : state);

const isBurnPartHeldToTheSheet = ({ model }: BurnModelState, partId: number): boolean =>
  !!model?.parts.some((part: BurnPart): boolean => part.id === partId && !isBurnPartLiftable(part));

/** The own lift that brings a part down to height 0: below its parent, when that parent stands lifted. */
const getBurnPartLowestLiftMm = ({ model, liftMmByPartId }: BurnModelState, partId: number): number => {
  const partsById: Map<number, BurnPart> = new Map<number, BurnPart>(
    (model?.parts ?? []).map((part: BurnPart): [number, BurnPart] => [part.id, part]),
  );
  const parentId: number | undefined = partsById.get(partId)?.parentId;
  const parent: BurnPart | undefined = parentId ? partsById.get(parentId) : undefined;

  return parent ? 0 - getBurnPartEffectiveLiftMm(parent, partsById, liftMmByPartId) : 0;
};

const getStateWithLift = (state: BurnModelState, { partId, liftMm }: BurnPartLiftedPayload): BurnModelState => {
  if (isBurnPartHeldToTheSheet(state, partId)) {
    return state;
  }

  return {
    ...state,
    liftMmByPartId: {
      ...state.liftMmByPartId,
      [partId]: Math.max(liftMm, getBurnPartLowestLiftMm(state, partId)),
    },
  };
};

export const burnModelReducer = (
  state: BurnModelState = INITIAL_BURN_MODEL_STATE,
  action: Action<unknown>,
): BurnModelState => {
  switch (action.type) {
  case BurnModelRequested.type:
    return {
      ...state,
      status: BURN_MODEL_STATUS.BUILDING,
      builtMaterialId: (action as BurnModelRequested).payload.materialId,
    };
  case BurnModelReady.type:
    return {
      ...state,
      status: BURN_MODEL_STATUS.READY,
      model: (action as BurnModelReady).payload.model,
      selectedPartId: undefined,
      liftMmByPartId: {},
      hoveredPartId: undefined,
    };
  case BurnModelFailed.type:
    return { ...state, status: BURN_MODEL_STATUS.FAILED };
  case BurnPartSelected.type:
    return { ...state, selectedPartId: (action as BurnPartSelected).payload.partId };
  case BurnPartLifted.type:
    return getStateWithLift(state, (action as BurnPartLifted).payload);
  case BurnPartHovered.type:
    return { ...state, hoveredPartId: (action as BurnPartHovered).payload.partId };
  case BurnPartLiftsReset.type:
    return { ...state, liftMmByPartId: {} };
  case BedViewModeChanged.type:
    // The row or the canvas under the pointer goes away without saying so. The build goes on: the Cut check count is
    // shown in every view.
    return { ...state, hoveredPartId: undefined };
  case MaterialSaved.type:
    return getStateAfterMaterialChange(state, (action as MaterialSaved).payload.material.id);
  case MaterialTestResultSaved.type:
    return getStateAfterMaterialChange(state, (action as MaterialTestResultSaved).payload.materialId);
  case ProjectMaterialSelected.type:
    return (action as ProjectMaterialSelected).payload.materialId === state.builtMaterialId
      ? state
      : getStateAfterInputChange(state);
  default:
    return BURN_MODEL_INPUT_CHANGE_ACTION_TYPES.includes(action.type) ? getStateAfterInputChange(state) : state;
  }
};
// #endregion

// #region Selectors
type RootState = { [BURN_MODEL_STATE_NAME]: BurnModelState };

export const selectBurnModel = (state: RootState): BurnModel | undefined => state[BURN_MODEL_STATE_NAME].model;

/** The model only while it matches the project: a stale one may even come from a project opened before this one. */
export const selectCurrentBurnModel = (state: RootState): BurnModel | undefined =>
  (state[BURN_MODEL_STATE_NAME].status === BURN_MODEL_STATUS.READY ? selectBurnModel(state) : undefined);

export const selectBurnModelStatus = (state: RootState): BurnModelStatus => state[BURN_MODEL_STATE_NAME].status;

export const selectBuiltBurnMaterialId = (state: RootState): string | undefined =>
  state[BURN_MODEL_STATE_NAME].builtMaterialId;

export const selectSelectedBurnPartId = (state: RootState): number | undefined =>
  state[BURN_MODEL_STATE_NAME].selectedPartId;

export const selectHoveredBurnPartId = (state: RootState): number | undefined =>
  state[BURN_MODEL_STATE_NAME].hoveredPartId;

/** Clamped, because a parent lowered later leaves a child's stored lift below what can be seen and dragged. */
export const selectBurnPartLiftMm = (partId: number) => (state: RootState): number => {
  const burnModelState: BurnModelState = state[BURN_MODEL_STATE_NAME];

  return Math.max(burnModelState.liftMmByPartId[partId] ?? 0, getBurnPartLowestLiftMm(burnModelState, partId));
};

export const selectBurnPartEffectiveLiftsMm = createSelector(
  [selectBurnModel, (state: RootState): BurnPartLiftsMm => state[BURN_MODEL_STATE_NAME].liftMmByPartId],
  (model: BurnModel | undefined, liftsMm: BurnPartLiftsMm): BurnPartLiftsMm => {
    const parts: BurnPart[] = model?.parts ?? [];
    const partsById: Map<number, BurnPart> = new Map<number, BurnPart>(
      parts.map((part: BurnPart): [number, BurnPart] => [part.id, part]),
    );

    return Object.fromEntries(parts.map((part: BurnPart): [number, number] => [
      part.id,
      getBurnPartEffectiveLiftMm(part, partsById, liftsMm),
    ]));
  },
);

export const selectHasLiftedBurnPart = (state: RootState): boolean =>
  Object.values(selectBurnPartEffectiveLiftsMm(state)).some((liftMm: number): boolean => liftMm > 0);

export const selectBurnPartEffectiveLiftMm = (partId: number) => (state: RootState): number =>
  selectBurnPartEffectiveLiftsMm(state)[partId] ?? 0;
// #endregion
