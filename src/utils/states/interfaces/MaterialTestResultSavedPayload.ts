/**
 * What the MaterialTestResultSaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MaterialTestResult } from '../../materials/interfaces/MaterialTestResult';

export interface MaterialTestResultSavedPayload {
  /** The material the test was made on. */
  materialId: string;
  /** The test result, replacing the earlier one of the same machine profile. */
  testResult: MaterialTestResult;
}
