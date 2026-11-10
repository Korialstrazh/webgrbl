/**
 * Keeps the name a project is shown with once artwork first arrives: while the project still has the default name of
 * a new project, the derived name (its first object and the day it was made) is stored as its own name. Deleting every
 * object later then never turns the title back into the default name, which would read as lost work.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { put, select } from 'redux-saga/effects';
import { i18n } from '../localization/localization';
import { getDefaultProjectName } from '../project/get.default.project.name';
import { selectProjectDisplayName } from './project.display.name.selector';
import { ProjectRenameRequested, selectProjectId, selectProjectName } from './project.state';

export function* storeDerivedProjectName(): Generator {
  const projectId: string | undefined = (yield select(selectProjectId)) as string | undefined;
  const projectName: string = (yield select(selectProjectName)) as string;
  const displayName: string = (yield select(selectProjectDisplayName(i18n.language))) as string;
  const isDerivedNameNew: boolean = projectName === getDefaultProjectName() && displayName !== projectName;

  if (projectId && isDerivedNameNew) {
    yield put(new ProjectRenameRequested({ projectId, name: displayName }));
  }
}
