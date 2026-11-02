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
import { call, put, select } from 'redux-saga/effects';
import { DEFAULT } from '../localization/default.locales';
import type { Material } from '../materials/interfaces/Material';
import { MATERIAL_REPOSITORY } from '../materials/material.repository';
import type { Palette } from '../palette/interfaces/Palette';
import { getImportedProjectFile } from '../project/get.imported.project.file';
import type { ImportedProjectFile } from '../project/interfaces/ImportedProjectFile';
import type { StoredProject } from '../project/interfaces/StoredProject';
import { MAX_PROJECT_FILE_BYTES } from '../project/project.constants';
import { PROJECT_REPOSITORY } from '../project/project.repository';
import { MaterialsLoaded } from './material.state';
import { selectPalette } from './palette.state';
import { showProjectErrorToast } from './project.error.toast.saga';
import type { ProjectFileImportRequested } from './project.state';
import { switchToCreatedProject } from './project.switch.to.created.saga';

/** The palette is passed in, so a version 1 file gets layers derived from the current palette. */
const readProjectFile = async (projectFile: File, palette: Palette): Promise<ImportedProjectFile | undefined> => {
  if (projectFile.size > MAX_PROJECT_FILE_BYTES) {
    return undefined;
  }

  try {
    return getImportedProjectFile(await projectFile.text(), palette);
  } catch {
    // A file that cannot be read is treated like an invalid one; the reason never reaches the user.
    return undefined;
  }
};

/** A material whose id is already stored stays as it is here, with its own name and test results. */
function* storeImportedMaterial(importedMaterial: Material): Generator {
  yield call([MATERIAL_REPOSITORY, MATERIAL_REPOSITORY.addMissingMaterial], importedMaterial);

  const storedMaterials: Material[] =
    (yield call([MATERIAL_REPOSITORY, MATERIAL_REPOSITORY.listMaterials])) as Material[];

  yield put(new MaterialsLoaded({ materials: storedMaterials }));
}

/** The new project is stored before the open one closes, so no edit waits on storage between the close and the load. */
function* storeAndOpenImportedProject(importedFile: ImportedProjectFile): Generator {
  if (importedFile.material) {
    yield call(storeImportedMaterial, importedFile.material);
  }

  const createdProject: StoredProject =
    (yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.createProject], importedFile.name)) as StoredProject;

  yield call([PROJECT_REPOSITORY, PROJECT_REPOSITORY.saveDocument], createdProject.id, importedFile.document);
  yield call(switchToCreatedProject, { project: createdProject, document: importedFile.document });
}

export function* importProjectFile(action: ProjectFileImportRequested): Generator {
  const palette: Palette = (yield select(selectPalette)) as Palette;
  const importedFile: ImportedProjectFile | undefined =
    (yield call(readProjectFile, action.payload.file, palette)) as ImportedProjectFile | undefined;

  if (!importedFile) {
    yield call(showProjectErrorToast, DEFAULT.TOAST_PROJECT_FILE_INVALID);

    return;
  }

  yield call(storeAndOpenImportedProject, importedFile);
}
