/**
 * The size of the bed in millimetres and why it is only a placeholder, if it is.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedPlaceholderKind } from '../bed.constants';

export interface BedDimensions {
  widthMm: number;
  heightMm: number;
  /** Why the size is not the real machine size; none when it is. */
  placeholderKind: BedPlaceholderKind;
}
