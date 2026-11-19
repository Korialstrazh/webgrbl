/**
 * Returns what the burn depth estimate is based on, from the material test of the machine.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import { BURN_DEPTH_BASIS_KIND, GUESS_DEPTH_MM_PER_DOSE } from './burn.model.constants';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';

const GUESS_BASIS: BurnDepthBasis = {
  kind: BURN_DEPTH_BASIS_KIND.GUESS,
  testDose: 0,
  testThicknessMm: 0,
  depthMmPerDose: GUESS_DEPTH_MM_PER_DOSE,
};

const hasUsableDose = (testDose: number, testResult: MaterialTestResult): boolean =>
  Number.isFinite(testDose) && testDose > 0 && testResult.thicknessMm > 0;

export const getBurnDepthBasis = (testResult: MaterialTestResult | undefined): BurnDepthBasis => {
  if (!testResult) {
    return GUESS_BASIS;
  }

  const testDose = (testResult.powerPercent * testResult.passes) / testResult.speedMmPerMin;

  if (!hasUsableDose(testDose, testResult)) {
    return GUESS_BASIS;
  }

  if (testResult.depthMm && testResult.depthMm > 0) {
    return {
      kind: BURN_DEPTH_BASIS_KIND.DEPTH,
      testDose,
      testThicknessMm: testResult.thicknessMm,
      depthMmPerDose: testResult.depthMm / testDose,
    };
  }

  const kind =
    testResult.outcome === MATERIAL_TEST_OUTCOME.CUT_THROUGH
      ? BURN_DEPTH_BASIS_KIND.CUT_THROUGH
      : BURN_DEPTH_BASIS_KIND.NOT_THROUGH;

  return {
    kind,
    testDose,
    testThicknessMm: testResult.thicknessMm,
    depthMmPerDose: testResult.thicknessMm / testDose,
  };
};
