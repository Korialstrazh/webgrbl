/**
 * Reads the list of stored projects into the state, for the Open dialog.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
