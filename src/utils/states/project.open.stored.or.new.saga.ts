/**
 * Opens a stored project, or, when there is no id or the project is gone, creates an empty one with the default name in
 * the user's language and opens that.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call } from 'redux-saga/effects';
import { getDefaultProjectName } from '../project/get.default.project.name';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import type { StoredProject } from '../project/interfaces/StoredProject';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { openLoadedProject } from './project.open.saga';

function* openNewDefaultProject(): Generator {
  const createdProject: StoredProject =
    (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.createProject], getDefaultProjectName())) as StoredProject;

  yield call(openLoadedProject, { project: createdProject, document: { objects: [], layers: [] } });
}

export function* openStoredOrNewProject(projectId: string | undefined): Generator {
  const storedProject: LoadedProject | undefined = projectId
    ? (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.getProject], projectId)) as LoadedProject | undefined
    : undefined;

  if (storedProject) {
    yield call(openLoadedProject, storedProject);

    return;
  }

  yield call(openNewDefaultProject);
}
