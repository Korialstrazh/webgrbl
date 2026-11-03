/**
 * Builds the burn model through the injected worker client while the 3D view is open, a material is set and the
 * toolpath is ready.
 *
 * - takeLatest also listens for every change that makes the toolpath out of date. Nothing is built then, but the
 *   running build is cancelled, because its result would look current for a job that has changed.
 * - Coming back to a view with a ready model builds nothing, so the lifts stay. A ready model is current, because the
 *   state makes it stale when any of its inputs change, whatever the view.
 * - A material change rebuilds at once, as it is not a toolpath input: the toolpath stays ready.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Task } from 'redux-saga';
import { all, call, join, put, select, takeLatest } from 'redux-saga/effects';
import { BED_VIEW_MODE } from '../bed/bed.view.constants';
import type { BedViewMode } from '../bed/bed.view.constants';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnModelGeneration } from '../burn.model/interfaces/BurnModelGeneration';
import type { BurnModelWorkerClient } from '../burn.model/interfaces/BurnModelWorkerClient';
import { logBurnModelError } from '../burn.model/log.burn.model.error';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT } from '../localization/default.locales';
import type { Material } from '../materials/interfaces/Material';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { Action } from './action';
import { BedViewModeChanged, selectBedViewMode } from './bed.view.state';
import { BURN_MODEL_STATUS } from './burn.model.status.constants';
import type { BurnModelStatus } from './burn.model.status.constants';
import { BurnModelFailed, BurnModelReady, BurnModelRequested, selectBurnModelStatus } from './burn.model.state';
import { ActiveMachineProfileSelected } from './machine.profile.state';
import { selectActiveMaterial, selectActiveMaterialTestResult } from './material.selectors';
import { MaterialSaved, MaterialTestResultSaved } from './material.state';
import { PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { ProjectMaterialSelected, selectProjectLayers } from './project.document.state';
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

const BURN_MODEL_ACTION_TYPES: string[] = [
  ToolpathReady.type,
  BedViewModeChanged.type,
  MaterialSaved.type,
  MaterialTestResultSaved.type,
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

  yield put(new BurnModelRequested());

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

/** A view change alone does not make a ready model out of date, and rebuilding it would drop the lifts. */
const isViewChangeOverCurrentModel = (action: Action<unknown>, modelStatus: BurnModelStatus): boolean =>
  action.type === BedViewModeChanged.type && modelStatus === BURN_MODEL_STATUS.READY;

function* runBurnModelAction(client: BurnModelWorkerClient, action: Action<unknown>): Generator {
  const viewMode: BedViewMode = (yield select(selectBedViewMode)) as BedViewMode;
  const material: Material | undefined = (yield select(selectActiveMaterial)) as Material | undefined;
  const toolpathStatus: ToolpathStatus = (yield select(selectToolpathStatus)) as ToolpathStatus;
  const toolpath: Toolpath | undefined = (yield select(selectToolpath)) as Toolpath | undefined;
  const modelStatus: BurnModelStatus = (yield select(selectBurnModelStatus)) as BurnModelStatus;

  if (
    viewMode === BED_VIEW_MODE.THREE_D
    && toolpathStatus === TOOLPATH_STATUS.READY
    && material
    && toolpath
    && !isViewChangeOverCurrentModel(action, modelStatus)
  ) {
    yield call(buildBurnModel, client, toolpath, material);
  }
}

export function* watchBurnModel(client: BurnModelWorkerClient): Generator {
  try {
    const watcherTasks: Task[] = (yield all([
      takeLatest(BURN_MODEL_ACTION_TYPES, runBurnModelAction, client),
    ])) as Task[];

    // The watcher runs as a fork, so the saga waits on it here; its finally then runs only when the store stops.
    yield join(watcherTasks);
  } finally {
    client.dispose();
  }
}
