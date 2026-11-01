/**
 * Reports the status after a document was written: saved only when the document still is the one written, so a change
 * made during the write keeps the project unsaved and the autosave saves again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
