/**
 * Downloads the open project as a .webgrbl.json file that carries every object with its SVG text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { call, select } from 'redux-saga/effects';
import { downloadTextFile } from '../browser/download.text.file';
import type { Material } from '../materials/interfaces/Material';
import { getProjectFileName } from '../project/get.project.file.name';
import { getProjectFileText } from '../project/get.project.file.text';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { PROJECT_FILE_MIME_TYPE } from '../project/project.constants';
import { selectActiveMaterial } from './material.selectors';
import { selectProjectDocument } from './project.document.state';
import { selectProjectName } from './project.state';

export function* exportProjectFile(): Generator {
  const projectName: string = (yield select(selectProjectName)) as string;
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;
  const material: Material | undefined = (yield select(selectActiveMaterial)) as Material | undefined;

  yield call(downloadTextFile, {
    text: getProjectFileText(projectName, projectDocument, material),
    fileName: getProjectFileName(projectName),
    mimeType: PROJECT_FILE_MIME_TYPE,
  });
}
