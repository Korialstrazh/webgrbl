/**
 * The parts of a job and which cells belong to each.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnPart } from './BurnPart';

export interface BurnPartSet {
  /** The parts in id order. */
  parts: BurnPart[];
  /** Part id per grid cell; BURN_REGION_LABEL_NONE for the sheet around parts, walls and dropped regions. */
  regionLabels: Int32Array;
}
