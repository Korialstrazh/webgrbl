/**
 * Builds a material test result for tests; fields not given take the fixture default values.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialTestResult } from './interfaces/MaterialTestResult';
import { MATERIAL_TEST_OUTCOME } from './material.constants';
import {
  FIXTURE_TEST_RESULT_PASSES,
  FIXTURE_TEST_RESULT_POWER_PERCENT,
  FIXTURE_TEST_RESULT_PROFILE_ID,
  FIXTURE_TEST_RESULT_SPEED_MM_PER_MIN,
  FIXTURE_TEST_RESULT_TESTED_AT_ISO,
  FIXTURE_TEST_RESULT_THICKNESS_MM,
} from './test.result.fixture.constants';

export const newTestResultFixture = (overrides: Partial<MaterialTestResult> = {}): MaterialTestResult => ({
  machineProfileId: FIXTURE_TEST_RESULT_PROFILE_ID,
  powerPercent: FIXTURE_TEST_RESULT_POWER_PERCENT,
  speedMmPerMin: FIXTURE_TEST_RESULT_SPEED_MM_PER_MIN,
  passes: FIXTURE_TEST_RESULT_PASSES,
  thicknessMm: FIXTURE_TEST_RESULT_THICKNESS_MM,
  outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
  depthMm: undefined,
  testedAtIso: FIXTURE_TEST_RESULT_TESTED_AT_ISO,
  ...overrides,
});
