/**
 * Generates the project's toolpath through the injected worker client and exports it as G-code.
 *
 * - A request reads the drawables on the main thread (parsing needs DOMParser) and hands only plain
 *   data to the worker. takeLatest cancels the running generation on a new request or a cancel, and the generation's
 *   finally block cancels the worker.
 * - Parsed drawables are cached per object (BedDrawablesCache), so a layer change, a move or a resize parses no SVG
 *   again.
 * - The toolpath is kept current in the background: a document or machine area change restarts a running generation,
 *   and generates an idle or out-of-date toolpath, debounced by TOOLPATH_RESTART_DEBOUNCE_MS, so the result
 *   always matches the current document.
 * - An export started for one project is dropped, with an info toast, when another project opens before it downloads.
 * - When the store's sagas stop, the worker client is disposed.
 * - An export waits for a ready toolpath, generating it when needed. A toolpath with warnings opens the confirmation
 *   instead of downloading, until the user confirms; the dialog that asks lives in the UI, not here.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { buffers, channel } from 'redux-saga';
import type { Channel, Task } from 'redux-saga';
import { all, call, debounce, fork, join, put, race, select, take, takeLatest, takeLeading } from 'redux-saga/effects';
import { downloadTextFile } from '../browser/download.text.file';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { EVERY_ACTION_PATTERN } from '../redux.saga.constants';
import { BedDrawablesCache } from '../toolpath/bed.drawables.cache';
import { GCODE_MIME_TYPE } from '../toolpath/gcode.constants';
import { getGcodeFileName } from '../toolpath/get.gcode.file.name';
import type { BedDrawableSet } from '../toolpath/interfaces/BedDrawableSet';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathGeneration } from '../toolpath/interfaces/ToolpathGeneration';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import type { ToolpathWorkerClient } from '../toolpath/interfaces/ToolpathWorkerClient';
import { logToolpathGenerationError } from '../toolpath/log.toolpath.generation.error';
import type { Action } from './action';
import type { ToolpathWaitResult } from './interfaces/ToolpathWaitResult';
import { selectActiveMachineProfile } from './machine.profile.state';
import { PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import {
  ProjectDocumentLoaded,
  selectEnabledProjectLayers,
  selectProjectDocument,
  selectProjectLayers,
} from './project.document.state';
import { showProjectErrorToast } from './project.error.toast.saga';
import { getProjectGcodeText } from './project.gcode.text.saga';
import { ProjectOpened, selectProjectId, selectProjectName } from './project.state';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';
import { selectToolpathMachineArea } from './toolpath.machine.area.selector';
import { TOOLPATH_RESTART_DEBOUNCE_MS } from './toolpath.saga.constants';
import {
  GcodeExportConfirmationRequested,
  GcodeExportRequested,
  ToolpathCancelled,
  ToolpathFailed,
  ToolpathMachineAreaChanged,
  ToolpathProgress,
  ToolpathReady,
  ToolpathRequested,
  selectToolpath,
  selectToolpathDocumentVersion,
  selectToolpathStatus,
} from './toolpath.state';
import { TOOLPATH_STATUS } from './toolpath.status.constants';
import type { ToolpathStatus } from './toolpath.status.constants';

// Only the newest progress matters, so older ones the saga has not put yet are dropped.
const PROGRESS_BUFFER_SIZE = 1;
const TOOLPATH_INPUT_CHANGE_ACTION_TYPES: string[] = [
  ...PROJECT_TOOLPATH_INPUT_CHANGE_ACTION_TYPES,
  ToolpathMachineAreaChanged.type,
];

const TOOLPATH_BACKGROUND_STATUSES: readonly ToolpathStatus[] = [TOOLPATH_STATUS.IDLE, TOOLPATH_STATUS.STALE];

const hasMachineAreaChanged = (machineArea: ToolpathMachineArea, lastMachineArea: ToolpathMachineArea): boolean =>
  machineArea.workAreaXMm !== lastMachineArea.workAreaXMm
  || machineArea.workAreaYMm !== lastMachineArea.workAreaYMm
  || machineArea.originCorner !== lastMachineArea.originCorner;

/**
 * Watches the derived machine area, not a list of actions: with no active profile it follows a connect, a disconnect
 * and the $130/$131 settings, so it is checked after every action. A change that keeps the work area and origin (a
 * jog speed, a profile name, a status report) leaves the toolpath current.
 */
function* watchToolpathMachineArea(): Generator {
  let lastMachineArea: ToolpathMachineArea = (yield select(selectToolpathMachineArea)) as ToolpathMachineArea;

  while (true) {
    yield take(EVERY_ACTION_PATTERN);

    const machineArea: ToolpathMachineArea = (yield select(selectToolpathMachineArea)) as ToolpathMachineArea;

    if (hasMachineAreaChanged(machineArea, lastMachineArea)) {
      lastMachineArea = machineArea;
      yield put(new ToolpathMachineAreaChanged());
    }
  }
}

function* putToolpathProgress(progressChannel: Channel<number>): Generator {
  while (true) {
    const progress: number = (yield take(progressChannel)) as number;

    yield put(new ToolpathProgress({ progress }));
  }
}

function* generateToolpath(toolpathWorkerClient: ToolpathWorkerClient, drawablesCache: BedDrawablesCache): Generator {
  const documentVersion: number = (yield select(selectToolpathDocumentVersion)) as number;
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;
  const layers: ProjectLayer[] = (yield select(selectProjectLayers)) as ProjectLayer[];
  const machineArea: ToolpathMachineArea = (yield select(selectToolpathMachineArea)) as ToolpathMachineArea;
  const progressChannel: Channel<number> = channel<number>(buffers.sliding<number>(PROGRESS_BUFFER_SIZE));
  let generation: ToolpathGeneration | undefined;

  try {
    const drawableSet: BedDrawableSet = (yield call(
      [drawablesCache, drawablesCache.getBedDrawableSet],
      projectDocument,
    )) as BedDrawableSet;

    generation = toolpathWorkerClient.generate({ ...drawableSet, layers, machineArea }, (progress: number): void => {
      progressChannel.put(progress);
    });
    yield fork(putToolpathProgress, progressChannel);

    const toolpath: Toolpath = (yield generation.promise) as Toolpath;

    yield put(new ToolpathReady({ toolpath, documentVersion }));
  } catch (error: unknown) {
    logToolpathGenerationError(error);
    yield put(new ToolpathFailed());
    yield call(showProjectErrorToast, DEFAULT.TOAST_TOOLPATH_FAILED);
  } finally {
    generation?.cancel();
    progressChannel.close();
  }
}

/** A cancel only has to stop the running generation, which takeLatest has already done. */
function* runToolpathAction(
  toolpathWorkerClient: ToolpathWorkerClient,
  drawablesCache: BedDrawablesCache,
  action: Action<unknown>,
): Generator {
  if (action.type === ToolpathRequested.type) {
    yield call(generateToolpath, toolpathWorkerClient, drawablesCache);
  }
}

/**
 * Whether the background refresh must ask for a toolpath. A running generation always restarts, else its result would
 * be dropped as out of date and the status would never leave generating. An idle or out-of-date toolpath is generated
 * when there is a layer to burn, or when an older toolpath still holds moves: with every layer gone or off, the
 * regenerated toolpath is empty, so no frame or check describes geometry that no longer exists. A failed one waits for
 * the user, so a failure does not repeat its toast on every edit.
 */
const isToolpathRefreshNeeded = (
  status: ToolpathStatus,
  enabledLayers: ProjectLayer[],
  toolpath: Toolpath | undefined,
): boolean =>
  status === TOOLPATH_STATUS.GENERATING
  || ((!!enabledLayers.length || !!toolpath?.moves.length) && TOOLPATH_BACKGROUND_STATUSES.includes(status));

/** Keeps the toolpath current in the background once the inputs are quiet, so the Design view shows the job too. */
function* refreshToolpath(): Generator {
  const status: ToolpathStatus = (yield select(selectToolpathStatus)) as ToolpathStatus;
  const enabledLayers: ProjectLayer[] = (yield select(selectEnabledProjectLayers)) as ProjectLayer[];
  const toolpath: Toolpath | undefined = (yield select(selectToolpath)) as Toolpath | undefined;

  if (isToolpathRefreshNeeded(status, enabledLayers, toolpath)) {
    yield put(new ToolpathRequested());
  }
}

/** Whether the open project is no longer the one the export was started for. */
function* hasProjectChanged(exportProjectId: string | undefined, projectChange: Action<unknown>): Generator {
  const projectId: string | undefined = (yield select(selectProjectId)) as string | undefined;

  return projectChange.type === ProjectDocumentLoaded.type || projectId !== exportProjectId;
}

/**
 * The ready toolpath of the project the export was started for, generated first when needed; undefined when the
 * generation failed, was cancelled, or another project was opened meanwhile.
 */
function* waitForReadyToolpath(exportProjectId: string | undefined): Generator {
  while (true) {
    const status: ToolpathStatus = (yield select(selectToolpathStatus)) as ToolpathStatus;

    if (status === TOOLPATH_STATUS.READY) {
      return yield select(selectToolpath);
    }

    if (status !== TOOLPATH_STATUS.GENERATING) {
      yield put(new ToolpathRequested());
    }

    const waitResult: ToolpathWaitResult = (yield race({
      ready: take(ToolpathReady.type),
      stopped: take([ToolpathFailed.type, ToolpathCancelled.type]),
      projectChange: take([ProjectDocumentLoaded.type, ProjectOpened.type]),
    })) as ToolpathWaitResult;

    if (waitResult.stopped) {
      return undefined;
    }

    if (waitResult.projectChange && (yield call(hasProjectChanged, exportProjectId, waitResult.projectChange))) {
      yield put(new ToastShown({
        severity: TOAST_SEVERITY.INFO,
        messageKey: DEFAULT.TOAST_GCODE_EXPORT_DROPPED,
        messageParameters: NO_TOAST_PARAMETERS,
      }));

      return undefined;
    }
  }
}

function* downloadGcode(toolpath: Toolpath, profile: MachineProfile): Generator {
  const projectName: string = (yield select(selectProjectName)) as string;
  const gcodeText: string = (yield call(getProjectGcodeText, toolpath, profile)) as string;
  const fileName: string = getGcodeFileName(projectName);

  yield call(downloadTextFile, {
    text: gcodeText,
    fileName,
    mimeType: GCODE_MIME_TYPE,
  });
  yield put(new ToastShown({
    severity: TOAST_SEVERITY.INFO,
    messageKey: DEFAULT.TOAST_GCODE_EXPORTED,
    messageParameters: { fileName },
  }));
}

function* exportGcode(action: GcodeExportRequested): Generator {
  const startProfile: MachineProfile | undefined = (
    yield select(selectActiveMachineProfile)
  ) as MachineProfile | undefined;

  if (!startProfile) {
    return;
  }

  const exportProjectId: string | undefined = (yield select(selectProjectId)) as string | undefined;
  const toolpath: Toolpath | undefined = (yield call(waitForReadyToolpath, exportProjectId)) as Toolpath | undefined;

  if (!toolpath) {
    return;
  }

  // A ready toolpath matches the machine area of the profile active now, and a profile switch during the wait
  // regenerated it. So the origin mapping reads that same profile, not the one the export started with.
  const profile: MachineProfile | undefined = (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;

  if (!profile) {
    return;
  }

  if (toolpath.warnings.length && !action.payload.isWarningConfirmed) {
    yield put(new GcodeExportConfirmationRequested());

    return;
  }

  yield call(downloadGcode, toolpath, profile);
}

export function* watchToolpath(toolpathWorkerClient: ToolpathWorkerClient): Generator {
  const drawablesCache: BedDrawablesCache = new BedDrawablesCache();

  try {
    const watcherTasks: Task[] = (yield all([
      takeLatest(
        [ToolpathRequested.type, ToolpathCancelled.type],
        runToolpathAction,
        toolpathWorkerClient,
        drawablesCache,
      ),
      debounce(TOOLPATH_RESTART_DEBOUNCE_MS, TOOLPATH_INPUT_CHANGE_ACTION_TYPES, refreshToolpath),
      fork(watchToolpathMachineArea),
      takeLeading(GcodeExportRequested.type, exportGcode),
    ])) as Task[];

    // The watchers run as forks, so the saga waits on them here; its finally then runs only when the store stops.
    yield join(watcherTasks);
  } finally {
    toolpathWorkerClient.dispose();
  }
}
