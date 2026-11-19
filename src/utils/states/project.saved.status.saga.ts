/**
 * Reports the status after a document was written: saved only when the document still is the one written, so a change
 * made during the write keeps the project unsaved and the autosave saves again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { put, select } from 'redux-saga/effects';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { selectProjectDocument } from './project.document.state';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import type { ProjectSaveStatus } from './project.save.status.constants';
import { ProjectSaveStatusChanged } from './project.state';

export function* reportSavedProjectDocument(savedDocument: ProjectDocument): Generator {
  const currentDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;
  const saveStatus: ProjectSaveStatus = currentDocument === savedDocument
    ? PROJECT_SAVE_STATUS.SAVED
    : PROJECT_SAVE_STATUS.UNSAVED;

  yield put(new ProjectSaveStatusChanged({ saveStatus }));
}
