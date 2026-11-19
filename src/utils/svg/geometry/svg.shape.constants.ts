/**
 * Kinds of SVG content that produce no shapes, the attribute names of the basic shapes, and the limits used when a use
 * element is drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_HREF_ATTRIBUTE_NAME } from '../svg.constants';
import { SVG_TRANSFORM_ATTRIBUTE_NAME } from './svg.transform.constants';

/** Content that the job leaves out or that burns differently from how the bed shows it. */
export const SVG_UNSUPPORTED_KIND = {
  TEXT: 'text',
  IMAGE: 'image',
  /** Nested uses copied more elements than the budget allows; the rest is left out. */
  USE_LIMIT: 'use-limit',
  /** Some geometry lies outside the root viewport, so the bed does not show it but it still burns. */
  OFF_PAGE: 'off-page',
  /** An element has a clip-path or mask; it still burns in full. */
  CLIPPED: 'clipped',
  /** The SVG of the object could not be read again, so nothing of the object burns. */
  UNREADABLE: 'unreadable',
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
export const SVG_USE_OWN_ATTRIBUTE_NAMES: readonly string[] = [
  SVG_SHAPE_ATTRIBUTE.X,
  SVG_SHAPE_ATTRIBUTE.Y,
  SVG_SHAPE_ATTRIBUTE.WIDTH,
  SVG_SHAPE_ATTRIBUTE.HEIGHT,
  SVG_HREF_ATTRIBUTE_NAME,
  SVG_TRANSFORM_ATTRIBUTE_NAME,
];
/** Use attributes that set the size of the symbol or svg it draws. */
export const SVG_USE_VIEWPORT_ATTRIBUTE_NAMES: readonly string[] = [
  SVG_SHAPE_ATTRIBUTE.WIDTH,
  SVG_SHAPE_ATTRIBUTE.HEIGHT,
];
/** Symbol attributes with no meaning on the nested svg that stands in for a used symbol. */
export const SVG_SYMBOL_OWN_ATTRIBUTE_NAMES: readonly string[] = ['refX', 'refY'];
/**
 * Use elements are drawn by copying what they point to. A file that nests uses inside uses grows exponentially, so at
 * most this many elements are copied per SVG.
 */
export const SVG_USE_MAX_COPIED_ELEMENTS = 20_000;
/**
 * Elements counted while sizing use copies, across one whole SVG, whether the copy is then accepted or rejected. Many
 * distinct large references would otherwise each cost a count up to the copy budget; once this is spent, every further
 * use is left out.
 */
export const SVG_USE_INSPECTION_BUDGET = 200_000;
/** Elements that clip or mask other content; without them in the document a clip-path or mask has no effect. */
export const SVG_CLIPPING_ELEMENT_SELECTOR = 'clipPath, mask';
