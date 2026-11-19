/**
 * Gets the average length factor of an SVG matrix: the square root of how much it scales areas. A stroke width is a
 * single number, so under an uneven scale this is the closest single width.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgMatrix } from './interfaces/SvgMatrix';

export const getSvgMatrixAreaScale = (matrix: SvgMatrix): number =>
  Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));
