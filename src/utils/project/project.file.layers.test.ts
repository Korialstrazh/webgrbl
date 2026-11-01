import { describe, expect, it } from 'vitest';
import { getLayerKey } from '../layers/get.layer.key';
import { getLayerSettings } from '../layers/get.layer.settings';
import { getObjectsDerivedLayers } from '../layers/get.objects.derived.layers';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import {
  DEFAULT_CUT_ENTRY,
  DEFAULT_PALETTE,
  DEFAULT_SCORE_ENTRY,
  POWER_PERCENT_MAX,
} from '../palette/palette.constants';
import type { Palette } from '../palette/interfaces/Palette';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { getSanitizedSvg } from '../svg/get.sanitized.svg';
import type { SanitizedSvg } from '../svg/interfaces/SanitizedSvg';
import type { SvgImportFailure } from '../svg/interfaces/SvgImportFailure';
import { isSvgImportFailure } from '../svg/is.svg.import.failure';
import { getImportedProjectFile } from './get.imported.project.file';
import { getProjectFileText } from './get.project.file.text';
import type { ImportedProjectFile } from './interfaces/ImportedProjectFile';
import type { ProjectObject } from './interfaces/ProjectObject';
import { newProjectObject } from './new.project.object';
import { PROJECT_FILE_VERSION, PROJECT_FILE_VERSION_WITHOUT_LAYERS } from './project.constants';

const PROJECT_NAME = 'Coasters';
const RED = DEFAULT_CUT_ENTRY.colour;
const BLUE = DEFAULT_SCORE_ENTRY.colour;
const ORPHAN_COLOUR = '#00ffff';
const CHANGED_POWER_PERCENT = 42;
const OVER_MAX_POWER_PERCENT = 150;
const CUSTOM_CUT_PASSES = 7;
const ORPHAN_LAYER_ORDER = 5;

const getSanitizedColouredSvgText = (colour: string): string => {
  const sanitizeResult: SanitizedSvg | SvgImportFailure = getSanitizedSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm"><rect fill="${colour}" width="5" height="5"/></svg>`,
  );

  return isSvgImportFailure(sanitizeResult) ? '' : sanitizeResult.svgText;
};

const newColouredObject = (colour: string): ProjectObject => newProjectObject({
  svgText: getSanitizedColouredSvgText(colour),
  intrinsicWidthMm: 10,
  intrinsicHeightMm: 10,
});

const getLayersOf = (objects: ProjectObject[]): ProjectLayer[] =>
  getObjectsDerivedLayers(objects, DEFAULT_PALETTE, []);

const getFileValue = (objects: ProjectObject[], layers: ProjectLayer[]): Record<string, unknown> =>
  JSON.parse(getProjectFileText(PROJECT_NAME, { objects, layers }));

const getImportedValue = (fileValue: unknown, palette: Palette = DEFAULT_PALETTE): ImportedProjectFile | undefined =>
  getImportedProjectFile(JSON.stringify(fileValue), palette);

const getImportedLayer = (importedFile: ImportedProjectFile | undefined, layerKey: string): ProjectLayer | undefined =>
  importedFile?.document.layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey);

describe('project file layers', () => {
  it('writes version 2 with the layers', () => {
    const objects: ProjectObject[] = [newColouredObject(RED)];
    const fileValue: Record<string, unknown> = getFileValue(objects, getLayersOf(objects));

    expect(fileValue.version).toBe(PROJECT_FILE_VERSION);
    expect(PROJECT_FILE_VERSION).toBe(2);
    expect(Object.keys(fileValue)).toEqual(['format', 'version', 'name', 'objects', 'layers']);
  });

  it('round-trips the layers of a version 2 file', () => {
    const objects: ProjectObject[] = [newColouredObject(RED), newColouredObject(BLUE)];
    const changedLayers: ProjectLayer[] = getLayersOf(objects).map((layer: ProjectLayer): ProjectLayer => ({
      ...layer,
      enabled: getLayerKey(layer) !== BLUE,
      settings: { ...layer.settings, maxPowerPercent: CHANGED_POWER_PERCENT },
    }));
    const importedFile: ImportedProjectFile | undefined = getImportedProjectFile(
      getProjectFileText(PROJECT_NAME, { objects, layers: changedLayers }),
      DEFAULT_PALETTE,
    );

    expect(importedFile?.document.layers).toEqual(changedLayers);
  });

  it('derives the layers of a version 1 file from the current palette', () => {
    const objects: ProjectObject[] = [newColouredObject(RED)];
    const customPalette: Palette = {
      ...DEFAULT_PALETTE,
      entries: DEFAULT_PALETTE.entries.map((entry: PaletteEntry): PaletteEntry => (entry.id === DEFAULT_CUT_ENTRY.id
        ? { ...entry, passes: CUSTOM_CUT_PASSES }
        : entry)),
    };
    const { layers: _layers, ...versionOneValue } = getFileValue(objects, []);
    const importedFile: ImportedProjectFile | undefined = getImportedValue(
      { ...versionOneValue, version: PROJECT_FILE_VERSION_WITHOUT_LAYERS },
      customPalette,
    );

    expect(importedFile?.document.layers).toHaveLength(1);
    expect(getImportedLayer(importedFile, RED)?.paletteEntryId).toBe(DEFAULT_CUT_ENTRY.id);
    expect(getImportedLayer(importedFile, RED)?.settings.passes).toBe(CUSTOM_CUT_PASSES);
  });

  it('clamps a version 2 layer power of 150 to 100', () => {
    const objects: ProjectObject[] = [newColouredObject(RED)];
    const overPoweredLayers: ProjectLayer[] = getLayersOf(objects).map((layer: ProjectLayer): ProjectLayer => ({
      ...layer,
      settings: { ...layer.settings, maxPowerPercent: OVER_MAX_POWER_PERCENT },
    }));
    const importedFile: ImportedProjectFile | undefined = getImportedValue(getFileValue(objects, overPoweredLayers));

    expect(getImportedLayer(importedFile, RED)?.settings.maxPowerPercent).toBe(POWER_PERCENT_MAX);
  });

  it('keeps a layer whose colour no object draws and adds layers the file lacks', () => {
    const objects: ProjectObject[] = [newColouredObject(RED)];
    const orphanLayer: ProjectLayer = {
      colour: ORPHAN_COLOUR,
      enabled: false,
      order: ORPHAN_LAYER_ORDER,
      settings: getLayerSettings(DEFAULT_CUT_ENTRY),
      paletteEntryId: undefined,
      isShading: false,
    };
    const importedFile: ImportedProjectFile | undefined = getImportedValue(getFileValue(objects, [orphanLayer]));

    expect(getImportedLayer(importedFile, ORPHAN_COLOUR)?.order).toBe(ORPHAN_LAYER_ORDER);
    expect(getImportedLayer(importedFile, RED)?.paletteEntryId).toBe(DEFAULT_CUT_ENTRY.id);
  });

  it('rejects a version 2 file with a malformed layer or without layers', () => {
    const objects: ProjectObject[] = [newColouredObject(RED)];
    const fileValue: Record<string, unknown> = getFileValue(objects, getLayersOf(objects));
    const { layers: _layers, ...valueWithoutLayers } = fileValue;

    expect(getImportedValue({ ...fileValue, layers: [{ colour: RED, enabled: 'yes' }] })).toBeUndefined();
    expect(getImportedValue(valueWithoutLayers)).toBeUndefined();
  });

  it('rejects an unknown version', () => {
    const objects: ProjectObject[] = [newColouredObject(RED)];

    expect(getImportedValue({ ...getFileValue(objects, []), version: PROJECT_FILE_VERSION + 1 })).toBeUndefined();
  });
});
