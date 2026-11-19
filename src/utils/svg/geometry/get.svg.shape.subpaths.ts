/**
 * Gets the outline of an SVG basic shape or path as flattened subpaths, moved through a matrix and within the
 * tolerance in the matrix's output frame.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getFlattenedSvgSubpaths } from './flatten.svg.segments';
import { getSvgShapeSegments } from './get.svg.shape.segments';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import type { SvgSubpath } from './interfaces/SvgSubpath';

export const getSvgShapeSubpaths = (element: Element, matrix: SvgMatrix, tolerance: number): SvgSubpath[] =>
  getFlattenedSvgSubpaths(getSvgShapeSegments(element), matrix, tolerance);
