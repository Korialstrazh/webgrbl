/**
 * Generates the project's toolpath through the injected worker client and exports it as G-code.
 *
 * - A request reads the drawables with getBedDrawables on the main thread (it needs DOMParser) and hands only plain
 *   data to the worker. takeLatest cancels the running generation on a new request or a cancel, and the generation's
 *   finally block cancels the worker.
 * - A document change during a generation restarts it, so the result always matches the current document.
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
import type { Channel } from 'redux-saga';
import { all, call, fork, put, race, select, take, takeEvery, takeLatest, takeLeading } from 'redux-saga/effects';
import { downloadTextFile } from '../browser/download.text.file';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { getBedDrawables } from '../toolpath/get.bed.drawables';
import { getGcodeExportContext } from '../toolpath/get.gcode.export.context';
import { getGcodeFileName } from '../toolpath/get.gcode.file.name';
import { getGcodeText } from '../toolpath/get.gcode.text';
import { GCODE_MIME_TYPE } from '../toolpath/gcode.constants';
import type { BedDrawableSet } from '../toolpath/interfaces/BedDrawableSet';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathGeneration } from '../toolpath/interfaces/ToolpathGeneration';
import type { ToolpathWorkerClient } from '../toolpath/interfaces/ToolpathWorkerClient';
import { logToolpathGenerationError } from '../toolpath/log.toolpath.generation.error';
import type { Action } from './action';
import { selectGrblSettings } from './grbl.connection.state';
import type { ToolpathWaitResult } from './interfaces/ToolpathWaitResult';
import { selectActiveMachineProfile } from './machine.profile.state';
import { PROJECT_DOCUMENT_CHANGE_ACTION_TYPES } from './project.document.change.action.types';
import { selectProjectDocument, selectProjectLayers } from './project.document.state';
import { selectProjectName } from './project.state';
import { showProjectErrorToast } from './project.error.toast.saga';
import {
  GcodeExportConfirmationRequested,
  GcodeExportRequested,
  ToolpathCancelled,
  ToolpathFailed,
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

function* putToolpathProgress(progressChannel: Channel<number>): Generator {
  while (true) {
    const progress: number = (yield take(progressChannel)) as number;

    yield put(new ToolpathProgress({ progress }));
  }
}

function* generateToolpath(toolpathWorkerClient: ToolpathWorkerClient): Generator {
  const documentVersion: number = (yield select(selectToolpathDocumentVersion)) as number;
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;
  const layers: ProjectLayer[] = (yield select(selectProjectLayers)) as ProjectLayer[];
  const progressChannel: Channel<number> = channel<number>(buffers.sliding<number>(PROGRESS_BUFFER_SIZE));
  let generation: ToolpathGeneration | undefined;

  try {
    const drawableSet: BedDrawableSet = (yield call(getBedDrawables, projectDocument)) as BedDrawableSet;

    generation = toolpathWorkerClient.generate({ ...drawableSet, layers }, (progress: number): void => {
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
function* runToolpathAction(toolpathWorkerClient: ToolpathWorkerClient, action: Action<unknown>): Generator {
  if (action.type === ToolpathRequested.type) {
    yield call(generateToolpath, toolpathWorkerClient);
  }
}

function* restartRunningGeneration(): Generator {
  const status: ToolpathStatus = (yield select(selectToolpathStatus)) as ToolpathStatus;

  if (status === TOOLPATH_STATUS.GENERATING) {
    yield put(new ToolpathRequested());
  }
}

/** The ready toolpath, generated first when needed; undefined when the generation failed or was cancelled. */
function* waitForReadyToolpath(): Generator {
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
    })) as ToolpathWaitResult;

    if (waitResult.stopped) {
      return undefined;
    }
  }
}

function* downloadGcode(toolpath: Toolpath, profile: MachineProfile): Generator {
  const laserSettings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const projectName: string = (yield select(selectProjectName)) as string;
  const createdAtIso: string = new Date().toISOString();

  yield call(downloadTextFile, {
    text: getGcodeText(toolpath, getGcodeExportContext({ profile, laserSettings, projectName, createdAtIso })),
    fileName: getGcodeFileName(projectName),
    mimeType: GCODE_MIME_TYPE,
  });
}

function* exportGcode(action: GcodeExportRequested): Generator {
  const profile: MachineProfile | undefined = (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;

  if (!profile) {
    return;
  }

  const toolpath: Toolpath | undefined = (yield call(waitForReadyToolpath)) as Toolpath | undefined;

  if (!toolpath) {
    return;
  }

  if (toolpath.warnings.length && !action.payload.isWarningConfirmed) {
    yield put(new GcodeExportConfirmationRequested());

    return;
  }

  yield call(downloadGcode, toolpath, profile);
}

export function* watchToolpath(toolpathWorkerClient: ToolpathWorkerClient): Generator {
  yield all([
    takeLatest([ToolpathRequested.type, ToolpathCancelled.type], runToolpathAction, toolpathWorkerClient),
    takeEvery([...PROJECT_DOCUMENT_CHANGE_ACTION_TYPES], restartRunningGeneration),
    takeLeading(GcodeExportRequested.type, exportGcode),
  ]);
}
