/**
 * Moves a point through an SVG matrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgMatrix } from './interfaces/SvgMatrix';

export const getSvgMatrixPoint = (matrix: SvgMatrix, point: GeometryPoint): GeometryPoint => ({
  x: matrix.a * point.x + matrix.c * point.y + matrix.e,
  y: matrix.b * point.x + matrix.d * point.y + matrix.f,
});
