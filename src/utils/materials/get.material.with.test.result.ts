/**
 * Returns the material with a test result added, replacing the earlier result of the same machine profile.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Material } from './interfaces/Material';
import type { MaterialTestResult } from './interfaces/MaterialTestResult';

export const getMaterialWithTestResult = (material: Material, testResult: MaterialTestResult): Material => {
  const otherProfileResults: MaterialTestResult[] = [];

  for (const existingResult of material.testResults) {
    if (existingResult.machineProfileId !== testResult.machineProfileId) {
      otherProfileResults.push(existingResult);
    }
  }

  return { ...material, testResults: [...otherProfileResults, testResult] };
};
