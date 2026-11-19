/**
 * Reads the list of stored projects into the state, for the Open dialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { call, put } from 'redux-saga/effects';
import type { ProjectSummary } from '../project/interfaces/ProjectSummary';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { ProjectSummariesLoaded } from './project.state';

export function* loadProjectSummaries(): Generator {
  const summaries: ProjectSummary[] =
    (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.listProjects])) as ProjectSummary[];

  yield put(new ProjectSummariesLoaded({ summaries }));
}
