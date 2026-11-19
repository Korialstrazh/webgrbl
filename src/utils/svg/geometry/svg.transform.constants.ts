/**
 * Function names, patterns and argument counts of the SVG transform attribute, and the identity matrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgMatrix } from './interfaces/SvgMatrix';

export const SVG_TRANSFORM_FUNCTION = {
  MATRIX: 'matrix',
  TRANSLATE: 'translate',
  SCALE: 'scale',
  ROTATE: 'rotate',
  SKEW_X: 'skewX',
  SKEW_Y: 'skewY',
} as const;

export type SvgTransformFunction = (typeof SVG_TRANSFORM_FUNCTION)[keyof typeof SVG_TRANSFORM_FUNCTION];

export const SVG_TRANSFORM_FUNCTION_NAMES: readonly string[] = Object.values(SVG_TRANSFORM_FUNCTION);

/** The argument counts each transform function accepts; any other count makes the whole attribute invalid. */
export const SVG_TRANSFORM_ARGUMENT_COUNTS: Record<SvgTransformFunction, readonly number[]> = {
  [SVG_TRANSFORM_FUNCTION.MATRIX]: [6],
  [SVG_TRANSFORM_FUNCTION.TRANSLATE]: [1, 2],
  [SVG_TRANSFORM_FUNCTION.SCALE]: [1, 2],
  [SVG_TRANSFORM_FUNCTION.ROTATE]: [1, 3],
  [SVG_TRANSFORM_FUNCTION.SKEW_X]: [1],
  [SVG_TRANSFORM_FUNCTION.SKEW_Y]: [1],
};

export const SVG_TRANSFORM_LIST_PATTERN = /^[\s,]*(?:[a-zA-Z]+\s*\([^()]*\)[\s,]*)*$/;
export const SVG_TRANSFORM_FUNCTION_PATTERN = /([a-zA-Z]+)\s*\(([^()]*)\)/g;
export const SVG_TRANSFORM_ATTRIBUTE_NAME = 'transform';

export const SVG_IDENTITY_MATRIX: SvgMatrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
