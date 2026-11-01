/**
 * Opens a project read from the database: replaces the document, which clears the undo history, remembers it as the
 * last opened project and deletes the SVG rows of objects it no longer holds. Pruning here is safe because the history
 * is empty, so no undo can bring such an object back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put } from 'redux-saga/effects';
import { getProjectObjectIds } from '../project/get.project.object.ids';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { ProjectDocumentLoaded } from './project.document.state';
import { ProjectOpened } from './project.state';
import { loadProjectSummaries } from './project.summaries.saga';

export function* openLoadedProject({ project, document: projectDocument }: LoadedProject): Generator {
  yield put(new ProjectDocumentLoaded({ document: projectDocument }));
  yield put(new ProjectOpened({ projectId: project.id, name: project.name }));

  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.setLastOpenedProjectId], project.id);
  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.pruneAssets], project.id, getProjectObjectIds(projectDocument));
  yield call(loadProjectSummaries);
}
