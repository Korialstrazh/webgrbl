/**
 * Gets a square bed of real machine size for tests.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BED_PLACEHOLDER_KIND } from '../../../bed/bed.constants';
import type { BedDimensions } from '../../../bed/interfaces/BedDimensions';

export const newSquareBedDimensions = (sizeMm: number): BedDimensions => ({
  widthMm: sizeMm,
  heightMm: sizeMm,
  placeholderKind: BED_PLACEHOLDER_KIND.NONE,
});
