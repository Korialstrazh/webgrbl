/**
 * The parts of a job and which cells belong to each.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnPart } from './BurnPart';

export interface BurnPartSet {
  /** The parts in id order. */
  parts: BurnPart[];
  /** Part id per grid cell; BURN_REGION_LABEL_NONE for the sheet around parts, walls and dropped regions. */
  regionLabels: Int32Array;
}
