/**
 * Gets the largest factor by which an SVG matrix stretches any distance (its largest singular value). Dividing a
 * tolerance by it keeps a flattened curve within that tolerance after the matrix, in every direction.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgMatrix } from './interfaces/SvgMatrix';
import { SVG_HALF } from './svg.path.constants';

// The largest singular value is sqrt((S + sqrt(S^2 - 4 det^2)) / 2), with S the sum of the squared entries.
const DETERMINANT_TERM_FACTOR = 4;

export const getSvgMatrixMaxScale = (matrix: SvgMatrix): number => {
  const squaredSum: number = matrix.a ** 2 + matrix.b ** 2 + matrix.c ** 2 + matrix.d ** 2;
  const determinant: number = matrix.a * matrix.d - matrix.b * matrix.c;
  const spread: number = Math.sqrt(Math.max(0, squaredSum ** 2 - DETERMINANT_TERM_FACTOR * determinant ** 2));

  return Math.sqrt((squaredSum + spread) * SVG_HALF);
};
