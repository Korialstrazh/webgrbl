/**
 * Opens a .webgrbl.json project file as a new project with a new id, so it never overwrites a stored project. A file
 * that cannot be read or is not a valid project file shows an error toast and changes nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call } from 'redux-saga/effects';
import { DEFAULT } from '../localization/default.locales';
import { getImportedProjectFile } from '../project/get.imported.project.file';
import type { ImportedProjectFile } from '../project/interfaces/ImportedProjectFile';
import type { StoredProject } from '../project/interfaces/StoredProject';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { closeOpenProject } from './project.close.saga';
import { showProjectErrorToast } from './project.error.toast.saga';
import { openLoadedProject } from './project.open.saga';
import type { ProjectFileImportRequested } from './project.state';

const readProjectFile = async (projectFile: File): Promise<ImportedProjectFile | undefined> => {
  try {
    return getImportedProjectFile(await projectFile.text());
  } catch {
    // A file that cannot be read is treated like an invalid one; the reason never reaches the user.
    return undefined;
  }
};

function* storeImportedProject(importedFile: ImportedProjectFile): Generator {
  const createdProject: StoredProject =
    (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.createProject], importedFile.name)) as StoredProject;

  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.saveDocument], createdProject.id, importedFile.document);
  yield call(openLoadedProject, { project: createdProject, document: importedFile.document });
}

export function* importProjectFile(action: ProjectFileImportRequested): Generator {
  const importedFile: ImportedProjectFile | undefined =
    (yield call(readProjectFile, action.payload.file)) as ImportedProjectFile | undefined;

  if (!importedFile) {
    yield call(showProjectErrorToast, DEFAULT.TOAST_PROJECT_FILE_INVALID);

    return;
  }

  const isClosed: boolean = (yield call(closeOpenProject)) as boolean;

  if (isClosed) {
    yield call(storeImportedProject, importedFile);
  }
}
