import { describe, expect, it } from 'vitest';
import { POWER_PERCENT_MAX, SPEED_MM_PER_MIN_MIN } from '../palette/palette.constants';
import { getImportedMaterial } from './get.imported.material';
import type { Material } from './interfaces/Material';
import type { MaterialTestResult } from './interfaces/MaterialTestResult';
import {
  MATERIAL_NAME_LENGTH_MAX,
  MATERIAL_TEST_OUTCOME,
  MATERIAL_THICKNESS_MM_MAX,
  MATERIAL_THICKNESS_MM_MIN,
} from './material.constants';
import { newMaterial } from './new.material';

const PROFILE_ID = 'profile-a';

const newTestResult = (overrides: Partial<MaterialTestResult> = {}): MaterialTestResult => ({
  machineProfileId: PROFILE_ID,
  powerPercent: 100,
  speedMmPerMin: 300,
  passes: 1,
  thicknessMm: 3,
  outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
  depthMm: undefined,
  testedAtIso: '2026-11-03T10:00:00.000Z',
  ...overrides,
});

describe(getImportedMaterial.name, () => {
  it('keeps a material whose values are in range', () => {
    const material: Material = newMaterial({ testResults: [newTestResult()] });

    expect(getImportedMaterial(material)).toEqual(material);
  });

  it('copies only the known fields, so an extra field never reaches the database', () => {
    const importedMaterial: Material | undefined = getImportedMaterial({
      ...newMaterial({ testResults: [{ ...newTestResult(), extraResultField: 1 } as MaterialTestResult] }),
      extraField: 1,
    } as Material);

    expect(Object.keys(importedMaterial ?? {})).toEqual(['id', 'name', 'thicknessMm', 'testResults']);
    expect(Object.keys(importedMaterial?.testResults[0] ?? {})).not.toContain('extraResultField');
  });

  it('brings the thickness into range and cuts a long name', () => {
    const longName: string = 'x'.repeat(MATERIAL_NAME_LENGTH_MAX + 1);

    expect(getImportedMaterial(newMaterial({ thicknessMm: -5, name: longName }))?.thicknessMm)
      .toBe(MATERIAL_THICKNESS_MM_MIN);
    expect(getImportedMaterial(newMaterial({ thicknessMm: 1e9 }))?.thicknessMm).toBe(MATERIAL_THICKNESS_MM_MAX);
    expect(getImportedMaterial(newMaterial({ name: longName }))?.name).toHaveLength(MATERIAL_NAME_LENGTH_MAX);
  });

  it('brings test settings into range, so a test dose never divides by zero', () => {
    const importedMaterial: Material | undefined = getImportedMaterial(newMaterial({
      testResults: [newTestResult({ speedMmPerMin: 0, powerPercent: 500, passes: 0, depthMm: -1 })],
    }));

    expect(importedMaterial?.testResults[0]).toEqual(newTestResult({
      speedMmPerMin: SPEED_MM_PER_MIN_MIN,
      powerPercent: POWER_PERCENT_MAX,
      passes: 1,
      depthMm: 0,
    }));
  });

  it('keeps only the last result of a machine profile', () => {
    const lastResult: MaterialTestResult = newTestResult({ passes: 2 });

    expect(getImportedMaterial(newMaterial({ testResults: [newTestResult(), lastResult] }))?.testResults)
      .toEqual([lastResult]);
  });

  it('gives undefined for an empty id or a name that is empty after trimming', () => {
    expect(getImportedMaterial(newMaterial({ id: '' }))).toBeUndefined();
    expect(getImportedMaterial(newMaterial({ name: '   ' }))).toBeUndefined();
  });
});
