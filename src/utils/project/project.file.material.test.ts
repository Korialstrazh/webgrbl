import { describe, expect, it } from 'vitest';
import type { Material } from '../materials/interfaces/Material';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import { newMaterial } from '../materials/new.material';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import { getImportedProjectFile } from './get.imported.project.file';
import { getProjectFileText } from './get.project.file.text';
import type { ImportedProjectFile } from './interfaces/ImportedProjectFile';
import {
  PROJECT_FILE_VERSION,
  PROJECT_FILE_VERSION_WITHOUT_LAYERS,
  PROJECT_FILE_VERSION_WITHOUT_MATERIAL,
} from './project.constants';

const PROJECT_NAME = 'Coasters';
const OTHER_MATERIAL_ID = 'other-material';

const TESTED_MATERIAL: Material = newMaterial({
  testResults: [{
    machineProfileId: 'profile-a',
    powerPercent: 100,
    speedMmPerMin: 300,
    passes: 1,
    thicknessMm: 3,
    outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
    depthMm: undefined,
    testedAtIso: '2026-11-03T10:00:00.000Z',
  }],
});

const getMaterialFileValue = (): Record<string, unknown> => JSON.parse(getProjectFileText(
  PROJECT_NAME,
  { objects: [], layers: [], materialId: TESTED_MATERIAL.id },
  TESTED_MATERIAL,
));

const getImportedValue = (fileValue: unknown): ImportedProjectFile | undefined =>
  getImportedProjectFile(JSON.stringify(fileValue), DEFAULT_PALETTE);

describe('project file material', () => {
  it('writes version 3, with the material fields after the layers', () => {
    const fileValue: Record<string, unknown> = getMaterialFileValue();

    expect(PROJECT_FILE_VERSION).toBe(3);
    expect(PROJECT_FILE_VERSION_WITHOUT_MATERIAL).toBe(2);
    expect(fileValue.version).toBe(PROJECT_FILE_VERSION);
    expect(Object.keys(fileValue))
      .toEqual(['format', 'version', 'name', 'objects', 'layers', 'materialId', 'material']);
  });

  it('writes no material fields for a project without a material', () => {
    const fileValue: Record<string, unknown> =
      JSON.parse(getProjectFileText(PROJECT_NAME, { objects: [], layers: [] }, undefined));

    expect(Object.keys(fileValue)).toEqual(['format', 'version', 'name', 'objects', 'layers']);
  });

  it('round-trips the material of a version 3 file', () => {
    const importedFile: ImportedProjectFile | undefined = getImportedValue(getMaterialFileValue());

    expect(importedFile?.material).toEqual(TESTED_MATERIAL);
    expect(importedFile?.document.materialId).toBe(TESTED_MATERIAL.id);
  });

  it('opens a version 3 file without a material', () => {
    const importedFile: ImportedProjectFile | undefined =
      getImportedValue(JSON.parse(getProjectFileText(PROJECT_NAME, { objects: [], layers: [] }, undefined)));

    expect(importedFile?.material).toBeUndefined();
    expect(importedFile?.document.materialId).toBeUndefined();
  });

  it('opens a version 2 file with its layers and no material, ignoring a stray material field', () => {
    const { materialId: _materialId, ...fileValue } = getMaterialFileValue();
    const importedFile: ImportedProjectFile | undefined = getImportedValue({
      ...fileValue,
      version: PROJECT_FILE_VERSION_WITHOUT_MATERIAL,
      material: 'not a material',
    });

    expect(importedFile?.name).toBe(PROJECT_NAME);
    expect(importedFile?.material).toBeUndefined();
    expect(importedFile?.document.materialId).toBeUndefined();
  });

  it('rejects a version 2 file without layers', () => {
    const { layers: _layers, ...fileValue } = getMaterialFileValue();

    expect(getImportedValue({ ...fileValue, version: PROJECT_FILE_VERSION_WITHOUT_MATERIAL })).toBeUndefined();
  });

  it('opens a version 1 file with no material', () => {
    const { layers: _layers, material: _material, materialId: _materialId, ...fileValue } = getMaterialFileValue();
    const importedFile: ImportedProjectFile | undefined =
      getImportedValue({ ...fileValue, version: PROJECT_FILE_VERSION_WITHOUT_LAYERS });

    expect(importedFile?.name).toBe(PROJECT_NAME);
    expect(importedFile?.material).toBeUndefined();
    expect(importedFile?.document.materialId).toBeUndefined();
  });

  it('rejects a version 3 file with a malformed material', () => {
    const fileValue: Record<string, unknown> = getMaterialFileValue();

    expect(getImportedValue({ ...fileValue, material: { id: TESTED_MATERIAL.id } })).toBeUndefined();
    expect(getImportedValue({ ...fileValue, material: { ...TESTED_MATERIAL, thicknessMm: 'thick' } })).toBeUndefined();
    expect(getImportedValue({ ...fileValue, material: { ...TESTED_MATERIAL, name: ' ' } })).toBeUndefined();
    expect(getImportedValue({ ...fileValue, materialId: 7 })).toBeUndefined();
  });

  it('points the document at the embedded material when the two ids differ', () => {
    const importedFile: ImportedProjectFile | undefined =
      getImportedValue({ ...getMaterialFileValue(), materialId: OTHER_MATERIAL_ID });

    expect(importedFile?.document.materialId).toBe(TESTED_MATERIAL.id);
  });
});
