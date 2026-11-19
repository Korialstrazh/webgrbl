/**
 * Moves a point through an SVG matrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgMatrix } from './interfaces/SvgMatrix';

export const getSvgMatrixPoint = (matrix: SvgMatrix, point: GeometryPoint): GeometryPoint => ({
  x: matrix.a * point.x + matrix.c * point.y + matrix.e,
  y: matrix.b * point.x + matrix.d * point.y + matrix.f,
});
