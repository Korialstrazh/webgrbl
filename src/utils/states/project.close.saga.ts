/**
 * Closes the open project before another one opens: saves every pending change, then deletes the SVG rows of objects
 * its current document no longer holds. The next document load clears the undo history, so no undo can bring such an
 * object back. When a save fails the project stays open with its changes on screen, and the caller does not go on.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, select } from 'redux-saga/effects';
import { getProjectObjectIds } from '../project/get.project.object.ids';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { selectProjectDocument } from './project.document.state';
import { saveOpenProjectDocument } from './project.save.saga';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import type { ProjectSaveStatus } from './project.save.status.constants';
import { selectProjectId, selectProjectSaveStatus } from './project.state';

/** Saves until no change is pending, since the user may still edit while a save is written. */
function* savePendingProjectChanges(): Generator<unknown, boolean> {
  while (true) {
    const saveStatus: ProjectSaveStatus = (yield select(selectProjectSaveStatus)) as ProjectSaveStatus;

    if (saveStatus === PROJECT_SAVE_STATUS.SAVED) {
      return true;
    }

    const isSaved: boolean = (yield call(saveOpenProjectDocument)) as boolean;

    if (!isSaved) {
      return false;
    }
  }
}

/** Gives true when the project is closed, or none was open; false when its changes could not be saved. */
export function* closeOpenProject(): Generator<unknown, boolean> {
  const openProjectId: string | undefined = (yield select(selectProjectId)) as string | undefined;

  if (!openProjectId) {
    return true;
  }

  const isSaved: boolean = (yield call(savePendingProjectChanges)) as boolean;

  if (!isSaved) {
    return false;
  }

  // Read after the save: storing into a new project, when the old one was deleted elsewhere, changes the id.
  const projectId: string | undefined = (yield select(selectProjectId)) as string | undefined;
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;

  if (projectId) {
    yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.pruneAssets], projectId, getProjectObjectIds(projectDocument));
  }

  return true;
}
