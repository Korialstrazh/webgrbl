/**
 * What a burn depth estimate is based on: a guess or one material test.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnDepthBasisKind } from '../burn.model.constants';

export interface BurnDepthBasis {
  /** Whether the estimate is a guess or comes from a depth, a cut-through or a not-through test. */
  kind: BurnDepthBasisKind;
  /** Dose of the test; 0 for a guess. */
  testDose: number;
  /** Sheet thickness of the test in mm; 0 for a guess. */
  testThicknessMm: number;
  /** Burn depth in mm for one unit of dose. */
  depthMmPerDose: number;
}
