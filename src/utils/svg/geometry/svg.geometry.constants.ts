/**
 * Names, defaults and patterns used to resolve SVG styles and find the paints of the drawn elements.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';

export const SVG_GRADIENT_KIND = {
  LINEAR: 'linear',
  RADIAL: 'radial',
} as const;

export type SvgGradientKind = (typeof SVG_GRADIENT_KIND)[keyof typeof SVG_GRADIENT_KIND];

export const SVG_GRADIENT_UNITS = {
  OBJECT_BOUNDING_BOX: 'objectBoundingBox',
  USER_SPACE_ON_USE: 'userSpaceOnUse',
} as const;

export type SvgGradientUnits = (typeof SVG_GRADIENT_UNITS)[keyof typeof SVG_GRADIENT_UNITS];

export const SVG_LINEAR_GRADIENT_ELEMENT_NAME = 'linearGradient';
export const SVG_RADIAL_GRADIENT_ELEMENT_NAME = 'radialGradient';
export const SVG_STOP_ELEMENT_NAME = 'stop';

export const SVG_DRAWN_ELEMENT = {
  PATH: 'path',
  RECT: 'rect',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
  LINE: 'line',
  POLYLINE: 'polyline',
  POLYGON: 'polygon',
} as const;

export const SVG_DRAWN_ELEMENT_NAMES: readonly string[] = Object.values(SVG_DRAWN_ELEMENT);
/** Containers whose content is only drawn by reference, never where it stands. */
export const SVG_NOT_RENDERED_CONTAINER_NAMES: ReadonlySet<string> = new Set([
  'defs',
  'clipPath',
  'mask',
  'pattern',
  'marker',
  'symbol',
]);
export const SVG_NOT_RENDERED_ANCESTOR_SELECTOR: string = Array.from(SVG_NOT_RENDERED_CONTAINER_NAMES).join(', ');

export const SVG_ID_ATTRIBUTE_NAME = 'id';
export const SVG_GRADIENT_DEFAULT_LINEAR_END_X = 1;
export const SVG_GRADIENT_DEFAULT_CENTRE = 0.5;
export const SVG_GRADIENT_DEFAULT_RADIUS = 0.5;
export const SVG_GRADIENT_CHAIN_LIMIT = 16;
export const SVG_GRADIENT_ATTRIBUTE = {
  X1: 'x1',
  Y1: 'y1',
  X2: 'x2',
  Y2: 'y2',
  CX: 'cx',
  CY: 'cy',
  R: 'r',
} as const;
export const SVG_GRADIENT_UNITS_ATTRIBUTE_NAME = 'gradientUnits';
export const SVG_GRADIENT_TRANSFORM_ATTRIBUTE_NAME = 'gradientTransform';
export const SVG_OFFSET_ATTRIBUTE_NAME = 'offset';

export const SVG_PROPERTY = {
  FILL: 'fill',
  STROKE: 'stroke',
  STROKE_WIDTH: 'stroke-width',
  OPACITY: 'opacity',
  FILL_OPACITY: 'fill-opacity',
  STROKE_OPACITY: 'stroke-opacity',
  DISPLAY: 'display',
  VISIBILITY: 'visibility',
  STOP_COLOR: 'stop-color',
  STOP_OPACITY: 'stop-opacity',
  COLOR: 'color',
  CLIP_PATH: 'clip-path',
  FILL_RULE: 'fill-rule',
  MASK: 'mask',
} as const;

export const SVG_FILL_RULE = {
  NONZERO: 'nonzero',
  EVENODD: 'evenodd',
} as const;

export type SvgFillRule = (typeof SVG_FILL_RULE)[keyof typeof SVG_FILL_RULE];

export const SVG_FILL_RULES: readonly string[] = Object.values(SVG_FILL_RULE);

export const SVG_PAINT_NONE = 'none';
export const SVG_DISPLAY_NONE = 'none';
export const SVG_VISIBILITY_HIDDEN = 'hidden';
export const SVG_VISIBILITY_VISIBLE = 'visible';
export const SVG_CURRENT_COLOUR_KEYWORD = 'currentcolor';
export const SVG_INHERIT_KEYWORD = 'inherit';
export const SVG_UNSET_KEYWORD = 'unset';
export const SVG_INHERITING_KEYWORDS: readonly string[] = [SVG_INHERIT_KEYWORD, SVG_UNSET_KEYWORD];
export const SVG_DEFAULT_FILL = '#000000';
export const SVG_DEFAULT_STROKE_WIDTH = 1;
export const SVG_DEFAULT_OPACITY = 1;
export const SVG_DEFAULT_STOP_COLOUR = '#000000';

export const SVG_PAINT_URL_PATTERN = /^url\(\s*["']?#([^"')\s]+)["']?\s*\)/i;
export const SVG_OPACITY_DECIMALS = 3;
export const SVG_OPACITY_ROUNDING_FACTOR = 10 ** SVG_OPACITY_DECIMALS;

export const CSS_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
export const CSS_RULE_PATTERN = /([^{}]+)\{([^{}]*)\}/g;
export const CSS_SIMPLE_SELECTOR_PATTERN = /^(?:[a-zA-Z][\w-]*|\.[\w-]+|#[\w-]+)+$/;
export const CSS_SELECTOR_PART_PATTERN = /([.#]?)[\w-]+/g;
export const CSS_IMPORTANT_PATTERN = /\s*!important\s*$/i;
export const CSS_SELECTOR_SEPARATOR = ',';
export const CSS_DECLARATION_SEPARATOR = ';';
export const CSS_PROPERTY_VALUE_SEPARATOR = ':';
export const CSS_CLASS_PREFIX = '.';
export const CSS_ID_PREFIX = '#';
export const CSS_ID_SPECIFICITY = 10_000;
export const CSS_CLASS_SPECIFICITY = 100;
export const CSS_TYPE_SPECIFICITY = 1;

export const SVG_ROOT_DEFAULT_STYLE: SvgResolvedStyle = {
  fill: SVG_DEFAULT_FILL,
  stroke: SVG_PAINT_NONE,
  strokeWidth: SVG_DEFAULT_STROKE_WIDTH,
  opacity: SVG_DEFAULT_OPACITY,
  fillAlpha: SVG_DEFAULT_OPACITY,
  strokeAlpha: SVG_DEFAULT_OPACITY,
  colour: SVG_DEFAULT_FILL,
  fillOpacity: SVG_DEFAULT_OPACITY,
  strokeOpacity: SVG_DEFAULT_OPACITY,
  isDisplayed: true,
  isVisible: true,
  stopColour: SVG_DEFAULT_STOP_COLOUR,
  stopOpacity: SVG_DEFAULT_OPACITY,
  fillRule: SVG_FILL_RULE.NONZERO,
};
