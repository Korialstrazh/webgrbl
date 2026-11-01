/**
 * Closes the open project before another one opens: saves every pending change and gives back the project with the
 * document that was saved last. Nothing that can wait on storage runs after that last save, so the caller can load
 * the next document before any further edit lands in a document that is never saved. When a save fails the project
 * stays open with its changes on screen, and the caller does not go on.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, select } from 'redux-saga/effects';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectCloseResult } from './interfaces/ProjectCloseResult';
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

export function* closeOpenProject(): Generator<unknown, ProjectCloseResult> {
  const openProjectId: string | undefined = (yield select(selectProjectId)) as string | undefined;

  if (!openProjectId) {
    return { isClosed: true };
  }

  const isSaved: boolean = (yield call(savePendingProjectChanges)) as boolean;

  if (!isSaved) {
    return { isClosed: false };
  }

  // Read after the save: storing into a new project, when the old one was deleted elsewhere, changes the id.
  const projectId: string | undefined = (yield select(selectProjectId)) as string | undefined;
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;

  return { isClosed: true, closedProject: projectId ? { projectId, document: projectDocument } : undefined };
}
