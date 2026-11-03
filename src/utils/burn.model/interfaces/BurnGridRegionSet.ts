/**
 * The enclosed regions of a grid and which region each cell belongs to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnGridRegion } from './BurnGridRegion';

export interface BurnGridRegionSet {
  /** Every enclosed region in number order. */
  regions: BurnGridRegion[];
  /** Region number per cell; BURN_REGION_LABEL_NONE for walls and for cells the outside reaches. */
  regionNumbers: Int32Array;
}
