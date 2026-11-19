/**
 * Gets a material read from a project file ready for the database, or undefined when it has no usable id or name. The
 * guard only checks the types, and a file can come from anywhere, so the numbers are brought into range here: a test
 * speed of zero would otherwise make the test dose infinite. Only the known fields are copied, and a machine profile
 * keeps only its last test result.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getNumberInRange } from '../get.number.in.range';
import {
  PASSES_MAX,
  PASSES_MIN,
  POWER_PERCENT_MAX,
  POWER_PERCENT_MIN,
  SPEED_MM_PER_MIN_MAX,
  SPEED_MM_PER_MIN_MIN,
} from '../palette/palette.constants';
import { getMaterialWithTestResult } from './get.material.with.test.result';
import type { Material } from './interfaces/Material';
import type { MaterialTestResult } from './interfaces/MaterialTestResult';
import {
  MATERIAL_NAME_LENGTH_MAX,
  MATERIAL_THICKNESS_MM_MAX,
  MATERIAL_THICKNESS_MM_MIN,
} from './material.constants';

const MATERIAL_DEPTH_MM_MIN = 0;

const getImportedThicknessMm = (thicknessMm: number): number =>
  getNumberInRange(thicknessMm, MATERIAL_THICKNESS_MM_MIN, MATERIAL_THICKNESS_MM_MAX);

const getImportedDepthMm = (depthMm: number | undefined): number | undefined =>
  // A measured depth of 0 is a real value, different from no measurement.
  // eslint-disable-next-line no-restricted-syntax
  depthMm === undefined ? undefined : getNumberInRange(depthMm, MATERIAL_DEPTH_MM_MIN, MATERIAL_THICKNESS_MM_MAX);

const getImportedTestResult = (testResult: MaterialTestResult): MaterialTestResult => ({
  machineProfileId: testResult.machineProfileId,
  powerPercent: getNumberInRange(testResult.powerPercent, POWER_PERCENT_MIN, POWER_PERCENT_MAX),
  speedMmPerMin: getNumberInRange(testResult.speedMmPerMin, SPEED_MM_PER_MIN_MIN, SPEED_MM_PER_MIN_MAX),
  passes: Math.round(getNumberInRange(testResult.passes, PASSES_MIN, PASSES_MAX)),
  thicknessMm: getImportedThicknessMm(testResult.thicknessMm),
  outcome: testResult.outcome,
  depthMm: getImportedDepthMm(testResult.depthMm),
  testedAtIso: testResult.testedAtIso,
});

export const getImportedMaterial = (fileMaterial: Material): Material | undefined => {
  const materialName: string = fileMaterial.name.trim().slice(0, MATERIAL_NAME_LENGTH_MAX);

  if (!fileMaterial.id || !materialName) {
    return undefined;
  }

  let importedMaterial: Material = {
    id: fileMaterial.id,
    name: materialName,
    thicknessMm: getImportedThicknessMm(fileMaterial.thicknessMm),
    testResults: [],
  };

  for (const testResult of fileMaterial.testResults) {
    importedMaterial = getMaterialWithTestResult(importedMaterial, getImportedTestResult(testResult));
  }

  return importedMaterial;
};
