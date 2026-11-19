/**
 * Gets the matrix that undoes an SVG matrix, or undefined when the matrix flattens space and cannot be undone.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgMatrix } from './interfaces/SvgMatrix';

export const getSvgMatrixInverse = (matrix: SvgMatrix): SvgMatrix | undefined => {
  const { a, b, c, d, e, f } = matrix;
  const determinant: number = a * d - b * c;

  if (!determinant || !Number.isFinite(determinant)) {
    return undefined;
  }

  return {
    a: d / determinant,
    b: -b / determinant,
    c: -c / determinant,
    d: a / determinant,
    e: (c * f - d * e) / determinant,
    f: (b * e - a * f) / determinant,
  };
};
