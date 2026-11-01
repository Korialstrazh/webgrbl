/**
 * Gets the text of a .webgrbl.json project file: pretty JSON that carries every object with its SVG text, with the
 * fields always in the same order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectDocument } from './interfaces/ProjectDocument';
import type { ProjectFile } from './interfaces/ProjectFile';
import type { ProjectObject } from './interfaces/ProjectObject';
import { PROJECT_FILE_FORMAT, PROJECT_FILE_JSON_INDENT, PROJECT_FILE_VERSION } from './project.constants';

/** Copies only the known fields, in a fixed order, so no extra runtime field leaks into the file. */
const getProjectFileObject = (projectObject: ProjectObject): ProjectObject => ({
  id: projectObject.id,
  name: projectObject.name,
  svgText: projectObject.svgText,
  intrinsicWidthMm: projectObject.intrinsicWidthMm,
  intrinsicHeightMm: projectObject.intrinsicHeightMm,
  xMm: projectObject.xMm,
  yMm: projectObject.yMm,
  widthMm: projectObject.widthMm,
  heightMm: projectObject.heightMm,
  rotationDeg: projectObject.rotationDeg,
});

export const getProjectFileText = (projectName: string, projectDocument: ProjectDocument): string => {
  const projectFile: ProjectFile = {
    format: PROJECT_FILE_FORMAT,
    version: PROJECT_FILE_VERSION,
    name: projectName,
    objects: projectDocument.objects.map(getProjectFileObject),
  };

  return JSON.stringify(projectFile, undefined, PROJECT_FILE_JSON_INDENT);
};
