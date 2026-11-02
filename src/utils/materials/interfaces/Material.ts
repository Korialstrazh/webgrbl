/**
 * A sheet material the user burns on, with the laser tests made on it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MaterialTestResult } from './MaterialTestResult';

export interface Material {
  /** Random UUID, never reused. */
  id: string;
  /** Display name, 1 to 100 characters. */
  name: string;
  /** Sheet thickness in mm. */
  thicknessMm: number;
  /** The tests made on this material, at most one per machine profile. */
  testResults: MaterialTestResult[];
}
