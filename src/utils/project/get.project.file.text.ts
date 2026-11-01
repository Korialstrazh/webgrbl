/**
 * Gets the text of a .webgrbl.json project file: pretty JSON that carries every object with its SVG text and every
 * layer with its settings, with the fields always in the same order.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettings } from '../layers/interfaces/LayerSettings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
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
  isShading: layer.isShading,
});

export const getProjectFileText = (projectName: string, projectDocument: ProjectDocument): string => {
  const projectFile: ProjectFile = {
    format: PROJECT_FILE_FORMAT,
    version: PROJECT_FILE_VERSION,
    name: projectName,
    objects: projectDocument.objects.map(getProjectFileObject),
    layers: projectDocument.layers.map(getProjectFileLayer),
  };

  return JSON.stringify(projectFile, undefined, PROJECT_FILE_JSON_INDENT);
};
