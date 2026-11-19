/**
 * Builds the burn model through the injected worker client whenever a material is set and the toolpath is ready, in
 * every view, so the Cut check warning count is current wherever it is shown, not only after a visit to 3D.
 *
 * - The watcher is a take loop, not takeLatest. It also listens for every change that makes the toolpath out of date.
 *   Nothing is built then, but the running build is cancelled, because its result would look current for a job that
 *   has changed.
 * - A view change builds nothing and stops nothing, so the lifts stay. A ready model is current, because the state
 *   makes it stale when any of its inputs change, whatever the view.
 * - A material change rebuilds at once, as it is not a toolpath input: the toolpath stays ready.
 * - A change that does not touch the current model is ignored without stopping a running build: a save for another
 *   material, selecting the same material again, or materials read while a model is current. Rebuilding would drop
 *   the lifts.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Task } from 'redux-saga';
import { call, cancel, fork, join, put, select, take } from 'redux-saga/effects';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnModelGeneration } from '../burn.model/interfaces/BurnModelGeneration';
import type { BurnModelWorkerClient } from '../burn.model/interfaces/BurnModelWorkerClient';
import { logBurnModelError } from '../burn.model/log.burn.model.error';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT } from '../localization/default.locales';
import type { Material } from '../materials/interfaces/Material';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import { NEUTRAL_PREVIEW_MATERIAL } from '../materials/neutral.preview.material';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { Action } from './action';
import { BURN_MODEL_STATUS } from './burn.model.status.constants';
import type { BurnModelStatus } from './burn.model.status.constants';
import {
  BurnModelFailed,
  BurnModelReady,
  BurnModelRequested,
  selectBuiltBurnMaterialId,
  selectBurnModelStatus,
} from './burn.model.state';
import type { BurnModelActionContext } from './interfaces/BurnModelActionContext';
import { ActiveMachineProfileSelected } from './machine.profile.state';
import { selectActiveMaterial, selectActiveMaterialTestResult } from './material.selectors';
import { MaterialSaved, MaterialTestResultSaved, MaterialsLoaded } from './material.state';
import { PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { ProjectMaterialSelected, selectProjectDocument, selectProjectLayers } from './project.document.state';
import { showProjectErrorToast } from './project.error.toast.saga';
import {
  ToolpathMachineAreaChanged,
  ToolpathReady,
  ToolpathRequested,
  selectToolpath,
  selectToolpathStatus,
} from './toolpath.state';
import { TOOLPATH_STATUS } from './toolpath.status.constants';
import type { ToolpathStatus } from './toolpath.status.constants';

type BurnModelActionState =
  & Parameters<typeof selectProjectDocument>[0]
  & Parameters<typeof selectBurnModelStatus>[0];

const BURN_MODEL_ACTION_TYPES: string[] = [
  ToolpathReady.type,
  MaterialSaved.type,
  MaterialTestResultSaved.type,
  MaterialsLoaded.type,
  ProjectMaterialSelected.type,
  ActiveMachineProfileSelected.type,
  ToolpathRequested.type,
  ToolpathMachineAreaChanged.type,
  ...PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES,
];

function* buildBurnModel(client: BurnModelWorkerClient, toolpath: Toolpath, material: Material): Generator {
  const layers: ProjectLayer[] = (yield select(selectProjectLayers)) as ProjectLayer[];
  const testResult: MaterialTestResult | undefined = (
    yield select(selectActiveMaterialTestResult)
  ) as MaterialTestResult | undefined;
  let generation: BurnModelGeneration | undefined;

  yield put(new BurnModelRequested({ materialId: material.id }));

  try {
    generation = client.generate({ toolpath, layers, thicknessMm: material.thicknessMm, testResult });

    const model: BurnModel = (yield generation.promise) as BurnModel;

    yield put(new BurnModelReady({ model }));
  } catch (error: unknown) {
    logBurnModelError(error);
    yield put(new BurnModelFailed());
    yield call(showProjectErrorToast, DEFAULT.TOAST_BURN_MODEL_FAILED);
  } finally {
    generation?.cancel();
  }
}

const selectBurnModelActionContext = (state: BurnModelActionState): BurnModelActionContext => ({
  activeMaterialId: selectProjectDocument(state).materialId,
  builtMaterialId: selectBuiltBurnMaterialId(state),
  modelStatus: selectBurnModelStatus(state),
});

const isBurnModelCurrentOrComing = (modelStatus: BurnModelStatus): boolean =>
  modelStatus === BURN_MODEL_STATUS.READY || modelStatus === BURN_MODEL_STATUS.BUILDING;

const isMaterialActionIgnored = (
  action: Action<unknown>,
  { activeMaterialId, builtMaterialId, modelStatus }: BurnModelActionContext,
): boolean => {
  switch (action.type) {
  case MaterialSaved.type:
    return (action as MaterialSaved).payload.material.id !== activeMaterialId;
  case MaterialTestResultSaved.type:
    return (action as MaterialTestResultSaved).payload.materialId !== activeMaterialId;
  case ProjectMaterialSelected.type:
    return isBurnModelCurrentOrComing(modelStatus)
      && (action as ProjectMaterialSelected).payload.materialId === builtMaterialId;
  // A model built with the neutral stand-in, before the materials arrived, is rebuilt with the real one.
  case MaterialsLoaded.type:
    return isBurnModelCurrentOrComing(modelStatus) && builtMaterialId === activeMaterialId;
  default:
    return false;
  }
};

function* runBurnModelAction(client: BurnModelWorkerClient): Generator {
  const activeMaterial: Material | undefined = (yield select(selectActiveMaterial)) as Material | undefined;
  const material: Material = activeMaterial ?? NEUTRAL_PREVIEW_MATERIAL;
  const toolpathStatus: ToolpathStatus = (yield select(selectToolpathStatus)) as ToolpathStatus;
  const toolpath: Toolpath | undefined = (yield select(selectToolpath)) as Toolpath | undefined;

  if (toolpathStatus === TOOLPATH_STATUS.READY && toolpath) {
    yield call(buildBurnModel, client, toolpath, material);
  }
}

/** Like takeLatest, except that an ignored action leaves the running build alone, which takeLatest cannot do. */
function* watchBurnModelActions(client: BurnModelWorkerClient): Generator {
  let runningTask: Task | undefined;

  while (true) {
    const action: Action<unknown> = (yield take(BURN_MODEL_ACTION_TYPES)) as Action<unknown>;
    const context: BurnModelActionContext = (yield select(selectBurnModelActionContext)) as BurnModelActionContext;

    if (!isMaterialActionIgnored(action, context)) {
      if (runningTask) {
        yield cancel(runningTask);
      }

      runningTask = (yield fork(runBurnModelAction, client)) as Task;
    }
  }
}

export function* watchBurnModel(client: BurnModelWorkerClient): Generator {
  try {
    const watcherTask: Task = (yield fork(watchBurnModelActions, client)) as Task;

    // The watcher runs as a fork, so the saga waits on it here; its finally then runs only when the store stops.
    yield join(watcherTask);
  } finally {
    client.dispose();
  }
}
