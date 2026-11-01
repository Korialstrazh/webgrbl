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
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { getProjectObjectIds } from '../project/get.project.object.ids';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { ProjectDocumentLoaded } from './project.document.state';
import { deriveProjectLayers } from './project.layers.derive.saga';
import { ProjectOpened } from './project.state';
import { loadProjectSummaries } from './project.summaries.saga';

/**
 * The layers are derived before the document loads, so a project stored before projects had layers, or with a colour
 * that has no layer, opens with a layer for every colour; existing layers keep their settings.
 */
export function* openLoadedProject({ project, document: storedDocument }: LoadedProject): Generator {
  const derivedLayers: ProjectLayer[] =
    (yield call(deriveProjectLayers, storedDocument.objects, storedDocument.layers)) as ProjectLayer[];
  const projectDocument: ProjectDocument = { ...storedDocument, layers: derivedLayers };

  yield put(new ProjectDocumentLoaded({ document: projectDocument }));
  yield put(new ProjectOpened({ projectId: project.id, name: project.name }));

  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.setLastOpenedProjectId], project.id);
  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.pruneAssets], project.id, getProjectObjectIds(projectDocument));
  yield call(loadProjectSummaries);
}
