/**
 * Kinds of SVG content that produce no shapes, the attribute names of the basic shapes, and the limits used when a use
 * element is drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const SVG_UNSUPPORTED_KIND = {
  TEXT: 'text',
  IMAGE: 'image',
} as const;

export type SvgUnsupportedKind = (typeof SVG_UNSUPPORTED_KIND)[keyof typeof SVG_UNSUPPORTED_KIND];

/** Elements that draw nothing in the job, by local name, with the kind of warning they raise. */
export const SVG_UNSUPPORTED_ELEMENT_KINDS: ReadonlyMap<string, SvgUnsupportedKind> = new Map([
  ['text', SVG_UNSUPPORTED_KIND.TEXT],
  ['tspan', SVG_UNSUPPORTED_KIND.TEXT],
  ['textPath', SVG_UNSUPPORTED_KIND.TEXT],
  ['image', SVG_UNSUPPORTED_KIND.IMAGE],
]);

export const SVG_SHAPE_ATTRIBUTE = {
  X: 'x',
  Y: 'y',
  WIDTH: 'width',
  HEIGHT: 'height',
  RX: 'rx',
  RY: 'ry',
  CX: 'cx',
  CY: 'cy',
  R: 'r',
  X1: 'x1',
  Y1: 'y1',
  X2: 'x2',
  Y2: 'y2',
  POINTS: 'points',
  D: 'd',
} as const;

export const SVG_POINTS_NUMBER_PATTERN = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
export const SVG_COORDINATES_PER_POINT = 2;

export const SVG_USE_ELEMENT_NAME = 'use';
export const SVG_GROUP_ELEMENT_NAME = 'g';
export const SVG_SYMBOL_ELEMENT_NAME = 'symbol';
/** Attributes of a use element that place or point to the content, so they are not copied to its stand-in group. */
export const SVG_USE_OWN_ATTRIBUTE_NAMES: readonly string[] = ['x', 'y', 'width', 'height', 'href', 'transform'];
/** Attributes of a symbol that only make sense on a viewport, so they are not copied to its stand-in group. */
export const SVG_SYMBOL_OWN_ATTRIBUTE_NAMES: readonly string[] = [
  'viewBox',
  'preserveAspectRatio',
  'x',
  'y',
  'width',
  'height',
  'refX',
  'refY',
];
/**
 * Use elements are drawn by copying what they point to. A file that nests uses inside uses could grow without end, so
 * at most this many copies are made per SVG.
 */
export const SVG_USE_MAX_COPIES = 2000;
