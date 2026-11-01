/**
 * Saves the open project's document. A change that arrives while the save is written leaves the status unsaved, so
 * the autosave saves again. A rejected save leaves it unsaved and shows the failure toast once, until a save
 * succeeds again. When the project is gone, for example deleted in another tab, the document is stored in a new
 * project instead, without a toast, so no work is lost.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select } from 'redux-saga/effects';
import { DEFAULT } from '../localization/default.locales';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { logProjectStorageError } from '../project/log.project.storage.error';
import { ProjectNotFoundError } from '../project/project.not.found.error';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { selectProjectDocument } from './project.document.state';
import { showProjectErrorToast } from './project.error.toast.saga';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import { reportSavedProjectDocument } from './project.saved.status.saga';
import {
  ProjectSaveFailed,
  ProjectSaveStatusChanged,
  selectHasProjectSaveFailed,
  selectProjectId,
  selectProjectName,
} from './project.state';
import { storeDocumentInNewProject } from './project.store.in.new.saga';

function* recoverDeletedProject(): Generator<unknown, boolean> {
  try {
    const projectName: string = (yield select(selectProjectName)) as string;

    yield call(storeDocumentInNewProject, projectName);

    return true;
  } catch (recoveryError: unknown) {
    logProjectStorageError(recoveryError);

    return false;
  }
}

function* reportSaveFailure(saveError: unknown): Generator {
  const hasShownFailure: boolean = (yield select(selectHasProjectSaveFailed)) as boolean;

  logProjectStorageError(saveError);
  yield put(new ProjectSaveFailed());

  if (!hasShownFailure) {
    yield call(showProjectErrorToast, DEFAULT.TOAST_PROJECT_SAVE_FAILED);
  }
}

/** Gives true when the document was stored after all, in a new project. */
function* handleProjectSaveError(saveError: unknown): Generator<unknown, boolean> {
  if (saveError instanceof ProjectNotFoundError) {
    const isRecovered: boolean = (yield call(recoverDeletedProject)) as boolean;

    if (isRecovered) {
      return true;
    }
  }

  yield call(reportSaveFailure, saveError);

  return false;
}

/** Gives true when the document reached the database, false when it did not or no project is open. */
export function* saveOpenProjectDocument(): Generator<unknown, boolean> {
  const projectId: string | undefined = (yield select(selectProjectId)) as string | undefined;

  if (!projectId) {
    return false;
  }

  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;

  yield put(new ProjectSaveStatusChanged({ saveStatus: PROJECT_SAVE_STATUS.SAVING }));

  try {
    yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.saveDocument], projectId, projectDocument);
  } catch (saveError: unknown) {
    return (yield call(handleProjectSaveError, saveError)) as boolean;
  }

  yield call(reportSavedProjectDocument, projectDocument);

  return true;
}
