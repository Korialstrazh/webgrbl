/**
 * Gets a project from the text of a project file, or undefined when anything about the file is wrong. Every field is
 * type-checked and every object's SVG is sanitised again like a fresh import, because a file can come from anywhere.
 * Imported objects get new ids, so a file never overwrites or shares rows with an existing project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSanitizedSvg } from '../svg/get.sanitized.svg';
import type { SanitizedSvg } from '../svg/interfaces/SanitizedSvg';
import type { SvgImportFailure } from '../svg/interfaces/SvgImportFailure';
import { isSvgImportFailure } from '../svg/is.svg.import.failure';
import { getClampedObjectSizeMm } from './get.clamped.object.size.mm';
import { getNormalizedRotationDeg } from './get.normalized.rotation.deg';
import { getValidProjectName } from './get.valid.project.name';
import type { ImportedProjectFile } from './interfaces/ImportedProjectFile';
import type { ProjectFile } from './interfaces/ProjectFile';
import type { ProjectObject } from './interfaces/ProjectObject';
import { isProjectFile } from './is.project.file';
import { MAX_PROJECT_OBJECTS } from './project.constants';

const getParsedJsonValue = (jsonText: string): unknown => {
  try {
    return JSON.parse(jsonText);
  } catch {
    return undefined;
  }
};

const isImportableProjectFile = (value: unknown): value is ProjectFile =>
  isProjectFile(value) && value.objects.length <= MAX_PROJECT_OBJECTS;

/**
 * Copies only the known fields, so an extra field in the file never reaches the database. The intrinsic size is
 * measured from the SVG again, and the rotation is brought into one turn, because a huge angle breaks the geometry.
 */
const getImportedProjectObject = (fileObject: ProjectObject): ProjectObject | undefined => {
  const sanitizeResult: SanitizedSvg | SvgImportFailure = getSanitizedSvg(fileObject.svgText);

  if (isSvgImportFailure(sanitizeResult)) {
    return undefined;
  }

  return {
    id: crypto.randomUUID(),
    name: fileObject.name,
    svgText: sanitizeResult.svgText,
    intrinsicWidthMm: sanitizeResult.widthMm,
    intrinsicHeightMm: sanitizeResult.heightMm,
    xMm: fileObject.xMm,
    yMm: fileObject.yMm,
    widthMm: getClampedObjectSizeMm(fileObject.widthMm),
    heightMm: getClampedObjectSizeMm(fileObject.heightMm),
    rotationDeg: getNormalizedRotationDeg(fileObject.rotationDeg),
  };
};

export const getImportedProjectFile = (fileText: string): ImportedProjectFile | undefined => {
  const fileValue: unknown = getParsedJsonValue(fileText);

  if (!isImportableProjectFile(fileValue)) {
    return undefined;
  }

  const projectName: string | undefined = getValidProjectName(fileValue.name);

  if (!projectName) {
    return undefined;
  }

  const importedObjects: ProjectObject[] = [];

  for (const fileObject of fileValue.objects) {
    const importedObject: ProjectObject | undefined = getImportedProjectObject(fileObject);

    if (!importedObject) {
      return undefined;
    }

    importedObjects.push(importedObject);
  }

  return { name: projectName, document: { objects: importedObjects } };
};
