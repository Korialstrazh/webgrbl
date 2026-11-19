/**
 * Gets the text of a .webgrbl.json project file: pretty JSON that carries every object with its SVG text and every
 * layer with its settings, and a copy of the project's material, with the fields always in the same order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LayerSettings } from '../layers/interfaces/LayerSettings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { Material } from '../materials/interfaces/Material';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
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

const getProjectFileLayerSettings = (settings: LayerSettings): LayerSettings => ({
  mode: settings.mode,
  maxPowerPercent: settings.maxPowerPercent,
  minPowerPercent: settings.minPowerPercent,
  speedMmPerMin: settings.speedMmPerMin,
  passes: settings.passes,
  airAssist: settings.airAssist,
  lineIntervalMm: settings.lineIntervalMm,
});

/** A layer without a palette entry is written without the id field, since JSON has no undefined. */
const getProjectFileLayer = (layer: ProjectLayer): ProjectLayer => ({
  colour: layer.colour,
  enabled: layer.enabled,
  order: layer.order,
  settings: getProjectFileLayerSettings(layer.settings),
  paletteEntryId: layer.paletteEntryId,
  presetId: layer.presetId,
  isShading: layer.isShading,
});

const getProjectFileTestResult = (testResult: MaterialTestResult): MaterialTestResult => ({
  machineProfileId: testResult.machineProfileId,
  powerPercent: testResult.powerPercent,
  speedMmPerMin: testResult.speedMmPerMin,
  passes: testResult.passes,
  thicknessMm: testResult.thicknessMm,
  outcome: testResult.outcome,
  depthMm: testResult.depthMm,
  testedAtIso: testResult.testedAtIso,
});

const getProjectFileMaterial = (material: Material): Material => ({
  id: material.id,
  name: material.name,
  thicknessMm: material.thicknessMm,
  testResults: material.testResults.map(getProjectFileTestResult),
});

export const getProjectFileText = (
  projectName: string,
  projectDocument: ProjectDocument,
  material: Material | undefined,
): string => {
  const projectFile: ProjectFile = {
    format: PROJECT_FILE_FORMAT,
    version: PROJECT_FILE_VERSION,
    name: projectName,
    objects: projectDocument.objects.map(getProjectFileObject),
    layers: projectDocument.layers.map(getProjectFileLayer),
    materialId: projectDocument.materialId,
    material: material && getProjectFileMaterial(material),
  };

  return JSON.stringify(projectFile, undefined, PROJECT_FILE_JSON_INDENT);
};
