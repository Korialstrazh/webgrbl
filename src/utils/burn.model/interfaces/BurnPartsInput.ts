/**
 * The sheet and the depth estimate that parts are judged against.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnDepthBasis } from './BurnDepthBasis';

export interface BurnPartsInput {
  /** Sheet thickness in mm. */
  thicknessMm: number;
  /** What the depth estimate is based on. */
  basis: BurnDepthBasis;
}
