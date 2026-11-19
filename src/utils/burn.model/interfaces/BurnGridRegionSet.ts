/**
 * The enclosed regions of a grid and which region each cell belongs to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnGridRegion } from './BurnGridRegion';

export interface BurnGridRegionSet {
  /** Every enclosed region in number order. */
  regions: BurnGridRegion[];
  /** Region number per cell; BURN_REGION_LABEL_NONE for walls and for cells the outside reaches. */
  regionNumbers: Int32Array;
}
