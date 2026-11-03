/**
 * The burn model of the open project, the part selected in the 3D preview, and how far each part is lifted. Lifting
 * changes nothing in the project. Anything the model is made from going out of date makes a ready model stale. A
 * running build is cancelled by the saga at those same moments, so it stops counting as building.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { createSelector } from '@reduxjs/toolkit';
import { BURN_PART_LIFT_MAX_THICKNESSES } from '../burn.model/burn.model.constants';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnPart } from '../burn.model/interfaces/BurnPart';
import type { BurnPartLiftsMm } from '../burn.model/interfaces/BurnPartLiftsMm';
import { isBurnPartLiftable } from '../burn.model/is.burn.part.liftable';
import { getNumberInRange } from '../get.number.in.range';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import { BedViewModeChanged } from './bed.view.state';
import { BURN_MODEL_STATUS } from './burn.model.status.constants';
import type { BurnModelStatus } from './burn.model.status.constants';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { BurnModelReadyPayload } from './interfaces/BurnModelReadyPayload';
import type { BurnPartLiftedPayload } from './interfaces/BurnPartLiftedPayload';
import type { BurnPartSelectedPayload } from './interfaces/BurnPartSelectedPayload';
import { ActiveMachineProfileSelected } from './machine.profile.state';
import { MaterialSaved, MaterialTestResultSaved } from './material.state';
import { PROJECT_DOCUMENT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { ToolpathMachineAreaChanged, ToolpathRequested } from './toolpath.state';

// #region State
export interface BurnModelState {
  /** Where the model stands. */
  status: BurnModelStatus;
  /** The latest model, kept while it is stale or rebuilt; undefined before the first result. */
  model: BurnModel | undefined;
  /** The part selected in the 3D preview. */
  selectedPartId: number | undefined;
  /** How far the user lifted each part above its place, in mm, not counting what lifts its parents. */
  liftMmByPartId: BurnPartLiftsMm;
}
// #endregion

// #region State name
export const BURN_MODEL_STATE_NAME = 'burnModel';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(BURN_MODEL_STATE_NAME);
// #endregion

// #region Actions
export class BurnModelRequested extends Action {
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
// #endregion

// #region Initial state
const INITIAL_BURN_MODEL_STATE: BurnModelState = {
  status: BURN_MODEL_STATUS.IDLE,
  model: undefined,
  selectedPartId: undefined,
  liftMmByPartId: {},
};

// The test result, the thickness and the machine feed the model without changing the toolpath.
const BURN_MODEL_INPUT_CHANGE_ACTION_TYPES: readonly string[] = [
  ...PROJECT_DOCUMENT_CHANGE_ACTION_TYPES,
  ToolpathRequested.type,
  ToolpathMachineAreaChanged.type,
  MaterialSaved.type,
  MaterialTestResultSaved.type,
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

const isBurnPartHeldToTheSheet = ({ model }: BurnModelState, partId: number): boolean =>
  !!model?.parts.some((part: BurnPart): boolean => part.id === partId && !isBurnPartLiftable(part));

const getStateWithLift = (state: BurnModelState, { partId, liftMm }: BurnPartLiftedPayload): BurnModelState => {
  if (isBurnPartHeldToTheSheet(state, partId)) {
    return state;
  }

  return {
    ...state,
    liftMmByPartId: {
      ...state.liftMmByPartId,
      [partId]: getNumberInRange(liftMm, 0, (state.model?.thicknessMm ?? 0) * BURN_PART_LIFT_MAX_THICKNESSES),
    },
  };
};

export const burnModelReducer = (
  state: BurnModelState = INITIAL_BURN_MODEL_STATE,
  action: Action<unknown>,
): BurnModelState => {
  switch (action.type) {
  case BurnModelRequested.type:
    return { ...state, status: BURN_MODEL_STATUS.BUILDING };
  case BurnModelReady.type:
    return {
      status: BURN_MODEL_STATUS.READY,
      model: (action as BurnModelReady).payload.model,
      selectedPartId: undefined,
      liftMmByPartId: {},
    };
  case BurnModelFailed.type:
    return { ...state, status: BURN_MODEL_STATUS.FAILED };
  case BurnPartSelected.type:
    return { ...state, selectedPartId: (action as BurnPartSelected).payload.partId };
  case BurnPartLifted.type:
    return getStateWithLift(state, (action as BurnPartLifted).payload);
  case BedViewModeChanged.type:
    return getStateAfterBuildStopped(state);
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

export const selectSelectedBurnPartId = (state: RootState): number | undefined =>
  state[BURN_MODEL_STATE_NAME].selectedPartId;

export const selectBurnPartLiftMm = (partId: number) => (state: RootState): number =>
  state[BURN_MODEL_STATE_NAME].liftMmByPartId[partId] ?? 0;

const getBurnPartEffectiveLiftMm = (partId: number, parts: BurnPart[], liftsMm: BurnPartLiftsMm): number => {
  const seenPartIds: Set<number> = new Set<number>();
  let currentPart: BurnPart | undefined = parts.find((part: BurnPart): boolean => part.id === partId);
  let effectiveLiftMm = 0;

  while (currentPart && !seenPartIds.has(currentPart.id)) {
    const { id, parentId }: BurnPart = currentPart;

    seenPartIds.add(id);
    effectiveLiftMm += liftsMm[id] ?? 0;
    currentPart = parts.find((part: BurnPart): boolean => part.id === parentId);
  }

  return effectiveLiftMm;
};

export const selectBurnPartEffectiveLiftMm = (partId: number) => (state: RootState): number =>
  getBurnPartEffectiveLiftMm(
    partId,
    selectBurnModel(state)?.parts ?? [],
    state[BURN_MODEL_STATE_NAME].liftMmByPartId,
  );

export const selectBurnPartEffectiveLiftsMm = createSelector(
  [selectBurnModel, (state: RootState): BurnPartLiftsMm => state[BURN_MODEL_STATE_NAME].liftMmByPartId],
  (model: BurnModel | undefined, liftsMm: BurnPartLiftsMm): BurnPartLiftsMm => {
    const parts: BurnPart[] = model?.parts ?? [];

    return Object.fromEntries(parts.map(({ id }: BurnPart): [number, number] => [
      id,
      getBurnPartEffectiveLiftMm(id, parts, liftsMm),
    ]));
  },
);
// #endregion
