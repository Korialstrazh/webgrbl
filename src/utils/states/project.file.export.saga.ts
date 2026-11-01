/**
 * Downloads the open project as a .webgrbl.json file that carries every object with its SVG text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, select } from 'redux-saga/effects';
import { downloadTextFile } from '../browser/download.text.file';
import { getProjectFileName } from '../project/get.project.file.name';
import { getProjectFileText } from '../project/get.project.file.text';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import { PROJECT_FILE_MIME_TYPE } from '../project/project.constants';
import { selectProjectDocument } from './project.document.state';
import { selectProjectName } from './project.state';

export function* exportProjectFile(): Generator {
  const projectName: string = (yield select(selectProjectName)) as string;
  const projectDocument: ProjectDocument = (yield select(selectProjectDocument)) as ProjectDocument;

  yield call(downloadTextFile, {
    text: getProjectFileText(projectName, projectDocument),
    fileName: getProjectFileName(projectName),
    mimeType: PROJECT_FILE_MIME_TYPE,
  });
}
