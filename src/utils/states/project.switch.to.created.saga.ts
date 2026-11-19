/**
 * Switches to a project that was just created for the switch. When the open project cannot be saved it stays open,
 * and the created project is deleted again so no empty or duplicate project is left behind.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { call } from 'redux-saga/effects';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { switchToLoadedProject } from './project.switch.saga';

export function* switchToCreatedProject(createdProject: LoadedProject): Generator {
  const isSwitched: boolean = (yield call(switchToLoadedProject, createdProject)) as boolean;

  if (!isSwitched) {
    yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.deleteProject], createdProject.project.id);
  }
}
