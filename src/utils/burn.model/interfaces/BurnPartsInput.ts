/**
 * The sheet and the depth estimate that parts are judged against.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnDepthBasis } from './BurnDepthBasis';

export interface BurnPartsInput {
  /** Sheet thickness in mm. */
  thicknessMm: number;
  /** What the depth estimate is based on. */
  basis: BurnDepthBasis;
}
