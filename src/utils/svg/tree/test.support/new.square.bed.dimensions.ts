/**
 * Gets a square bed of real machine size for tests.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BED_PLACEHOLDER_KIND } from '../../../bed/bed.constants';
import type { BedDimensions } from '../../../bed/interfaces/BedDimensions';

export const newSquareBedDimensions = (sizeMm: number): BedDimensions => ({
  widthMm: sizeMm,
  heightMm: sizeMm,
  placeholderKind: BED_PLACEHOLDER_KIND.NONE,
});
