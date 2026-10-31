/**
 * The size of the bed in millimetres and why it is only a placeholder, if it is.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedPlaceholderKind } from '../bed.constants';

export interface BedDimensions {
  widthMm: number;
  heightMm: number;
  /** Why the size is not the real machine size; none when it is. */
  placeholderKind: BedPlaceholderKind;
}
