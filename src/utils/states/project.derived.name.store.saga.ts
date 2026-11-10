/**
 * Keeps the name a project is shown with once artwork first arrives: while the project still has the default name of
 * a new project, the derived name (its first object and the day and time it was made) is stored as its own name,
 * with a number after it, such as "(2)", when another project already reads the same. Deleting every object later
 * then never turns the title back into the default name, which would read as lost work.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select } from 'redux-saga/effects';
import { i18n } from '../localization/localization';
import { getDefaultProjectName } from '../project/get.default.project.name';
import { getProjectDisplayName } from '../project/get.project.display.name';
import { getUniqueProjectName } from '../project/get.unique.project.name';
import type { ProjectSummary } from '../project/interfaces/ProjectSummary';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { selectProjectDisplayName } from './project.display.name.selector';
import { ProjectRenameRequested, selectProjectId, selectProjectName } from './project.state';

const getOtherProjectNames = async (projectId: string): Promise<string[]> => {
  const summaries: ProjectSummary[] = await PROJECT_REPOSITORY.listProjects();

  return summaries
    .filter((summary: ProjectSummary): boolean => summary.id !== projectId)
    .map((summary: ProjectSummary): string => getProjectDisplayName(summary, i18n.language));
};

export function* storeDerivedProjectName(): Generator {
  const projectId: string | undefined = (yield select(selectProjectId)) as string | undefined;
  const projectName: string = (yield select(selectProjectName)) as string;
  const displayName: string = (yield select(selectProjectDisplayName(i18n.language))) as string;
  const isDerivedNameNew: boolean = projectName === getDefaultProjectName() && displayName !== projectName;

  if (!projectId || !isDerivedNameNew) {
    return;
  }

  const takenNames: string[] = (yield call(getOtherProjectNames, projectId)) as string[];

  yield put(new ProjectRenameRequested({ projectId, name: getUniqueProjectName(displayName, takenNames) }));
}
