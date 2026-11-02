/**
 * Returns the material with a test result added, replacing the earlier result of the same machine profile.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
