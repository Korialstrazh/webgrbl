/**
 * What the MaterialTestResultSaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialTestResult } from '../../materials/interfaces/MaterialTestResult';

export interface MaterialTestResultSavedPayload {
  /** The material the test was made on. */
  materialId: string;
  /** The test result, replacing the earlier one of the same machine profile. */
  testResult: MaterialTestResult;
}
