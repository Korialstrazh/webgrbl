/**
 * Runs the projects: opens the last opened project at start (or a new one that keeps the document on screen), and
 * handles New, Open, Rename, Delete, Save, the file export and import, and the autosave writes.
 *
 * Every project command goes through one queue (an action channel read by one loop), so two commands never run at the
 * same time: an autosave write cannot land in the middle of New, Open, Delete or an import, and a project is never
 * half closed while another opens. Requests that arrive meanwhile wait in the channel in order. Each command catches
 * its own errors, so a rejected database call shows a fixed toast and never stops this or any other saga.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Channel } from 'redux-saga';
import { actionChannel, call, fork, put, select, take } from 'redux-saga/effects';
import { DEFAULT } from '../localization/default.locales';
import { getDefaultProjectName } from '../project/get.default.project.name';
import { getValidProjectName } from '../project/get.valid.project.name';
import type { LoadedProject } from '../project/interfaces/LoadedProject';
import type { ProjectSummary } from '../project/interfaces/ProjectSummary';
import type { StoredProject } from '../project/interfaces/StoredProject';
import { InvalidProjectNameError } from '../project/invalid.project.name.error';
import { logProjectStorageError } from '../project/log.project.storage.error';
import { ProjectNotFoundError } from '../project/project.not.found.error';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import type { Action } from './action';
import { watchProjectAutosave } from './project.autosave.saga';
import { SvgFilesImportRequested } from './project.document.state';
import { showProjectErrorToast } from './project.error.toast.saga';
import { exportProjectFile } from './project.file.export.saga';
import { importProjectFile } from './project.file.import.saga';
import { openLoadedProject } from './project.open.saga';
import { openStoredOrNewProject } from './project.open.stored.or.new.saga';
import { saveOpenProjectDocument } from './project.save.saga';
import { PROJECT_SAVE_STATUS } from './project.save.status.constants';
import type { ProjectSaveStatus } from './project.save.status.constants';
import {
  NewProjectRequested,
  ProjectAutosaveDue,
  ProjectDeleteRequested,
  ProjectFileExportRequested,
  ProjectFileImportRequested,
  ProjectOpenRequested,
  ProjectRenamed,
  ProjectRenameRequested,
  ProjectSaveRequested,
  ProjectSummariesRequested,
  selectProjectId,
  selectProjectSaveStatus,
} from './project.state';
import { storeDocumentInNewProject } from './project.store.in.new.saga';
import { loadProjectSummaries } from './project.summaries.saga';
import { switchToLoadedProject } from './project.switch.saga';
import { switchToCreatedProject } from './project.switch.to.created.saga';
import { importSvgFiles } from './svg.import.saga';

const PROJECT_COMMAND_ACTION_TYPES: string[] = [
  NewProjectRequested.type,
  ProjectOpenRequested.type,
  ProjectRenameRequested.type,
  ProjectDeleteRequested.type,
  ProjectSaveRequested.type,
  ProjectAutosaveDue.type,
  ProjectSummariesRequested.type,
  ProjectFileExportRequested.type,
  ProjectFileImportRequested.type,
  // An SVG import waits in the same queue, so it never lands in a document that a project switch is replacing, and
  // one sent while the first project opens waits for it.
  SvgFilesImportRequested.type,
];

/**
 * Without a last opened project, the new one takes the document on screen instead of an empty one, so nothing edited
 * before the first project opened is lost.
 */
function* startProjects(): Generator {
  const lastOpenedProjectId: string | undefined = (yield call(
    [PROJECT_REPOSITORY, PROJECT_REPOSITORY.getLastOpenedProjectId],
  )) as string | undefined;
  const lastOpenedProject: LoadedProject | undefined = lastOpenedProjectId
    ? (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.getProject], lastOpenedProjectId)) as
      LoadedProject | undefined
    : undefined;

  if (lastOpenedProject) {
    yield call(openLoadedProject, lastOpenedProject);

    return;
  }

  yield call(storeDocumentInNewProject, getDefaultProjectName());
}

/** The new project is created before the open one closes, so no edit waits on storage between close and load. */
function* createNewProject(): Generator {
  const createdProject: StoredProject =
    (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.createProject], getDefaultProjectName())) as StoredProject;

  yield call(switchToCreatedProject, { project: createdProject, document: { objects: [] } });
}

/** The requested project is read before the open one closes, so a project that is gone closes nothing. */
function* openRequestedProject(action: ProjectOpenRequested): Generator {
  const { projectId } = action.payload;
  const openProjectId: string | undefined = (yield select(selectProjectId)) as string | undefined;

  if (projectId === openProjectId) {
    return;
  }

  const requestedProject: LoadedProject | undefined =
    (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.getProject], projectId)) as LoadedProject | undefined;

  if (!requestedProject) {
    yield call(loadProjectSummaries);

    return;
  }

  yield call(switchToLoadedProject, requestedProject);
}

/** The open project is deleted without a save, then the most recently changed remaining project opens. */
function* deleteRequestedProject(action: ProjectDeleteRequested): Generator {
  const { projectId } = action.payload;
  const openProjectId: string | undefined = (yield select(selectProjectId)) as string | undefined;
  const isOpenProject: boolean = projectId === openProjectId;

  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.deleteProject], projectId);

  if (!isOpenProject) {
    yield call(loadProjectSummaries);

    return;
  }

  const remainingProjects: ProjectSummary[] =
    (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.listProjects])) as ProjectSummary[];

  yield call(openStoredOrNewProject, remainingProjects[0]?.id);
}

/**
 * An invalid name is ignored without a toast, and so is a name the repository rejects. A project deleted
 * in another tab only drops out of the list.
 */
function* renameRequestedProject(action: ProjectRenameRequested): Generator {
  const { projectId } = action.payload;
  const projectName: string | undefined = getValidProjectName(action.payload.name);

  if (!projectName) {
    return;
  }

  try {
    yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.renameProject], projectId, projectName);
  } catch (renameError: unknown) {
    if (renameError instanceof ProjectNotFoundError) {
      yield call(loadProjectSummaries);

      return;
    }

    if (renameError instanceof InvalidProjectNameError) {
      return;
    }

    throw renameError;
  }

  yield put(new ProjectRenamed({ projectId, name: projectName }));
  yield call(loadProjectSummaries);
}

/** A timer may fire after New, Open or an explicit save has already stored everything; then there is nothing to do. */
function* saveDueProjectChanges(): Generator {
  const saveStatus: ProjectSaveStatus = (yield select(selectProjectSaveStatus)) as ProjectSaveStatus;

  if (saveStatus !== PROJECT_SAVE_STATUS.SAVED) {
    yield call(saveOpenProjectDocument);
  }
}

function* handleProjectCommand(action: Action<unknown>): Generator {
  switch (action.type) {
  case NewProjectRequested.type:
    return yield call(createNewProject);
  case ProjectOpenRequested.type:
    return yield call(openRequestedProject, action as ProjectOpenRequested);
  case ProjectRenameRequested.type:
    return yield call(renameRequestedProject, action as ProjectRenameRequested);
  case ProjectDeleteRequested.type:
    return yield call(deleteRequestedProject, action as ProjectDeleteRequested);
  case ProjectSaveRequested.type:
    return yield call(saveOpenProjectDocument);
  case ProjectAutosaveDue.type:
    return yield call(saveDueProjectChanges);
  case ProjectSummariesRequested.type:
    return yield call(loadProjectSummaries);
  case ProjectFileExportRequested.type:
    return yield call(exportProjectFile);
  case ProjectFileImportRequested.type:
    return yield call(importProjectFile, action as ProjectFileImportRequested);
  case SvgFilesImportRequested.type:
    return yield call(importSvgFiles, action as SvgFilesImportRequested);
  default:
    return undefined;
  }
}

function* reportProjectStorageFailure(storageError: unknown): Generator {
  logProjectStorageError(storageError);
  yield call(showProjectErrorToast, DEFAULT.TOAST_PROJECT_STORAGE_FAILED);
}

function* startProjectsGuarded(): Generator {
  try {
    yield call(startProjects);
  } catch (storageError: unknown) {
    yield call(reportProjectStorageFailure, storageError);
  }
}

function* handleProjectCommandGuarded(action: Action<unknown>): Generator {
  try {
    yield call(handleProjectCommand, action);
  } catch (storageError: unknown) {
    yield call(reportProjectStorageFailure, storageError);
  }
}

export function* watchProjects(): Generator {
  // Created before the start, so requests sent while the first project opens wait for it.
  const commandChannel: Channel<Action<unknown>> =
    (yield actionChannel(PROJECT_COMMAND_ACTION_TYPES)) as Channel<Action<unknown>>;

  yield fork(watchProjectAutosave);
  yield call(startProjectsGuarded);

  while (true) {
    const commandAction: Action<unknown> = (yield take(commandChannel)) as Action<unknown>;

    yield call(handleProjectCommandGuarded, commandAction);
  }
}
