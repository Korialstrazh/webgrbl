/**
 * Stores the document on screen in a new project and makes that the open project, without loading a document: the
 * editor keeps its objects and undo history. Used at start, so edits made before the first project opened are kept, and
 * when the open project was deleted elsewhere, so no work is lost.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select } from 'redux-saga/effects';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { StoredProject } from '../project/interfaces/StoredProject';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { selectProjectDocument } from './project.document.state';
import { reportSavedProjectDocument } from './project.saved.status.saga';
import { ProjectOpened } from './project.state';
import { loadProjectSummaries } from './project.summaries.saga';

export function* storeDocumentInNewProject(projectName: string): Generator {
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;
  const createdProject: StoredProject =
    (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.createProject], projectName)) as StoredProject;

  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.saveDocument], createdProject.id, projectDocument);
  yield put(new ProjectOpened({ projectId: createdProject.id, name: createdProject.name }));
  yield call(reportSavedProjectDocument, projectDocument);
  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.setLastOpenedProjectId], createdProject.id);
  yield call(loadProjectSummaries);
}
