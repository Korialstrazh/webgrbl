/**
 * Gets the outline of an SVG basic shape or path as flattened subpaths, moved through a matrix and within the
 * tolerance in the matrix's output frame.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getFlattenedSvgSubpaths } from './flatten.svg.segments';
import { getSvgShapeSegments } from './get.svg.shape.segments';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import type { SvgSubpath } from './interfaces/SvgSubpath';

export const getSvgShapeSubpaths = (element: Element, matrix: SvgMatrix, tolerance: number): SvgSubpath[] =>
  getFlattenedSvgSubpaths(getSvgShapeSegments(element), matrix, tolerance);
