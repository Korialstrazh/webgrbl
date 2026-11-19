/**
 * Gets a project from the text of a project file, or undefined when anything about the file is wrong. Every field is
 * type-checked and every object's SVG is sanitised again like a fresh import, because a file can come from anywhere.
 * Imported objects get new ids, so a file never overwrites or shares rows with an existing project.
 *
 * Version 2 and 3 files carry their layers: each one is type-checked, its settings are clamped to the palette ranges,
 * and a layer whose colour no object draws is kept. Version 1 files have no layers. Either way, every colour the
 * objects draw that has no layer yet gets one from the given palette, so the function stays pure and the caller passes
 * the current palette in.
 *
 * Version 3 files can also carry a material, which is checked like the rest; a malformed one rejects the file. The
 * document then points at the embedded material, whatever the id field says. Versions 1 and 2 open with no material.
 * Any other version is rejected.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getClampedLayerSettings } from '../layers/get.clamped.layer.settings';
import { getLayerKey } from '../layers/get.layer.key';
import { getObjectsDerivedLayers } from '../layers/get.objects.derived.layers';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { getImportedMaterial } from '../materials/get.imported.material';
import type { Material } from '../materials/interfaces/Material';
import type { Palette } from '../palette/interfaces/Palette';
import { getNormalizedColour } from '../palette/normalize.colour';
import { getSanitizedSvg } from '../svg/get.sanitized.svg';
import type { SanitizedSvg } from '../svg/interfaces/SanitizedSvg';
import type { SvgImportFailure } from '../svg/interfaces/SvgImportFailure';
import { isSvgImportFailure } from '../svg/is.svg.import.failure';
import { getClampedObjectSizeMm } from './get.clamped.object.size.mm';
import { getNormalizedRotationDeg } from './get.normalized.rotation.deg';
import { getValidProjectName } from './get.valid.project.name';
import type { ImportedProjectFile } from './interfaces/ImportedProjectFile';
import type { ProjectFile } from './interfaces/ProjectFile';
import type { ProjectFileWithoutLayers } from './interfaces/ProjectFileWithoutLayers';
import type { ProjectFileWithoutMaterial } from './interfaces/ProjectFileWithoutMaterial';
import type { ProjectObject } from './interfaces/ProjectObject';
import { isProjectFile } from './is.project.file';
import { isProjectFileWithoutLayers } from './is.project.file.without.layers';
import { isProjectFileWithoutMaterial } from './is.project.file.without.material';
import {
  MAX_OBJECT_NAME_LENGTH,
  MAX_PROJECT_OBJECTS,
  PROJECT_FILE_VERSION,
  PROJECT_FILE_VERSION_WITHOUT_LAYERS,
} from './project.constants';

const getParsedJsonValue = (jsonText: string): unknown => {
  try {
    return JSON.parse(jsonText);
  } catch {
    return undefined;
  }
};

type ReadableProjectFile = ProjectFile | ProjectFileWithoutMaterial | ProjectFileWithoutLayers;

const isReadableProjectFile = (value: unknown): value is ReadableProjectFile =>
  isProjectFile(value) || isProjectFileWithoutMaterial(value) || isProjectFileWithoutLayers(value);

const isImportableProjectFile = (value: unknown): value is ReadableProjectFile =>
  isReadableProjectFile(value) && value.objects.length <= MAX_PROJECT_OBJECTS;

/**
 * Copies only the known fields, so an extra field in the file never reaches the database. The intrinsic size is
 * measured from the SVG again, the rotation is brought into one turn, because a huge angle breaks the geometry, and
 * the name is trimmed and cut to the object name limit, so a huge name cannot stretch the object list.
 */
const getImportedProjectObject = (fileObject: ProjectObject): ProjectObject | undefined => {
  const sanitizeResult: SanitizedSvg | SvgImportFailure = getSanitizedSvg(fileObject.svgText);

  if (isSvgImportFailure(sanitizeResult)) {
    return undefined;
  }

  return {
    id: crypto.randomUUID(),
    name: fileObject.name.trim().slice(0, MAX_OBJECT_NAME_LENGTH),
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

/**
 * Copies only the known fields and clamps the settings. The colour is normalised, so it matches the colours read from
 * the objects; a colour that cannot be read gives undefined.
 */
const getImportedProjectLayer = (fileLayer: ProjectLayer): ProjectLayer | undefined => {
  const layerColour: string | undefined = getNormalizedColour(fileLayer.colour);

  if (!layerColour) {
    return undefined;
  }

  return {
    colour: layerColour,
    enabled: fileLayer.enabled,
    order: fileLayer.order,
    settings: getClampedLayerSettings(fileLayer.settings),
    paletteEntryId: fileLayer.paletteEntryId,
    isShading: fileLayer.isShading,
  };
};

/** Gives undefined when a layer cannot be read; a second layer with a key already taken is left out. */
const getImportedProjectLayers = (fileLayers: ProjectLayer[]): ProjectLayer[] | undefined => {
  const importedLayers: ProjectLayer[] = [];
  const takenKeys: Set<string> = new Set<string>();

  for (const fileLayer of fileLayers) {
    const importedLayer: ProjectLayer | undefined = getImportedProjectLayer(fileLayer);

    if (!importedLayer) {
      return undefined;
    }

    if (!takenKeys.has(getLayerKey(importedLayer))) {
      takenKeys.add(getLayerKey(importedLayer));
      importedLayers.push(importedLayer);
    }
  }

  return importedLayers;
};

const getFileLayers = (fileValue: ReadableProjectFile): ProjectLayer[] | undefined =>
  fileValue.version === PROJECT_FILE_VERSION_WITHOUT_LAYERS ? [] : getImportedProjectLayers(fileValue.layers);

const getImportedProjectObjects = (fileObjects: ProjectObject[]): ProjectObject[] | undefined => {
  const importedObjects: ProjectObject[] = [];

  for (const fileObject of fileObjects) {
    const importedObject: ProjectObject | undefined = getImportedProjectObject(fileObject);

    if (!importedObject) {
      return undefined;
    }

    importedObjects.push(importedObject);
  }

  return importedObjects;
};

const getFileMaterial = (fileValue: ReadableProjectFile): Material | undefined =>
  fileValue.version === PROJECT_FILE_VERSION && fileValue.material ? fileValue.material : undefined;

const getFileMaterialId = (
  fileValue: ReadableProjectFile,
  importedMaterial: Material | undefined,
): string | undefined => {
  if (importedMaterial) {
    return importedMaterial.id;
  }

  return fileValue.version === PROJECT_FILE_VERSION && fileValue.materialId ? fileValue.materialId : undefined;
};

const isFileMaterialUnreadable = (
  fileMaterial: Material | undefined,
  importedMaterial: Material | undefined,
): boolean =>
  !!fileMaterial && !importedMaterial;

export const getImportedProjectFile = (fileText: string, palette: Palette): ImportedProjectFile | undefined => {
  const fileValue: unknown = getParsedJsonValue(fileText);

  if (!isImportableProjectFile(fileValue)) {
    return undefined;
  }

  const projectName: string | undefined = getValidProjectName(fileValue.name);

  if (!projectName) {
    return undefined;
  }

  const importedObjects: ProjectObject[] | undefined = getImportedProjectObjects(fileValue.objects);

  if (!importedObjects) {
    return undefined;
  }

  const fileLayers: ProjectLayer[] | undefined = getFileLayers(fileValue);

  if (!fileLayers) {
    return undefined;
  }

  const fileMaterial: Material | undefined = getFileMaterial(fileValue);
  const importedMaterial: Material | undefined = fileMaterial && getImportedMaterial(fileMaterial);

  if (isFileMaterialUnreadable(fileMaterial, importedMaterial)) {
    return undefined;
  }

  return {
    name: projectName,
    document: {
      objects: importedObjects,
      layers: getObjectsDerivedLayers(importedObjects, palette, fileLayers),
      materialId: getFileMaterialId(fileValue, importedMaterial),
    },
    material: importedMaterial,
  };
};
