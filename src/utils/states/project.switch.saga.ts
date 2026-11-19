/**
 * Replaces the open project with a loaded one. The next project is read, and for a new one created and stored,
 * before the open project closes; the close goes straight on to the load, so an edit made at any time lands either
 * in the old project before its last save or in the new one. The SVG rows the closed project no longer uses are
 * deleted afterwards. The next document load clears the undo history, so no undo can bring such an object back.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { call } from 'redux-saga/effects';
import { getProjectObjectIds } from '../project/get.project.object.ids';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import type { ProjectCloseResult } from './interfaces/ProjectCloseResult';
import { closeOpenProject } from './project.close.saga';
import { openLoadedProject } from './project.open.saga';

/** Gives false when the open project could not be saved and so stays open. */
export function* switchToLoadedProject(loadedProject: LoadedProject): Generator<unknown, boolean> {
  const closeResult: ProjectCloseResult = (yield call(closeOpenProject)) as ProjectCloseResult;

  if (!closeResult.isClosed) {
    return false;
  }

  yield call(openLoadedProject, loadedProject);

  if (closeResult.closedProject) {
    const { projectId, document: closedDocument } = closeResult.closedProject;

    yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.pruneAssets], projectId, getProjectObjectIds(closedDocument));
  }

  return true;
}
