/**
 * Closed sets and fixed values for SVG import: length units, size limits, removed-content and failure kinds, and the
 * names the sanitiser matches.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const SVG_LENGTH_UNIT = {
  MILLIMETRE: 'mm',
  CENTIMETRE: 'cm',
  INCH: 'in',
  POINT: 'pt',
  PICA: 'pc',
  PIXEL: 'px',
} as const;

export type SvgLengthUnit = (typeof SVG_LENGTH_UNIT)[keyof typeof SVG_LENGTH_UNIT];

export const MM_PER_INCH = 25.4;
export const SVG_PX_PER_INCH = 96;
const POINTS_PER_INCH = 72;
const PICAS_PER_INCH = 6;
const MM_PER_CM = 10;

export const SVG_LENGTH_UNIT_MM: Record<SvgLengthUnit, number> = {
  [SVG_LENGTH_UNIT.MILLIMETRE]: 1,
  [SVG_LENGTH_UNIT.CENTIMETRE]: MM_PER_CM,
  [SVG_LENGTH_UNIT.INCH]: MM_PER_INCH,
  [SVG_LENGTH_UNIT.POINT]: MM_PER_INCH / POINTS_PER_INCH,
  [SVG_LENGTH_UNIT.PICA]: MM_PER_INCH / PICAS_PER_INCH,
  [SVG_LENGTH_UNIT.PIXEL]: MM_PER_INCH / SVG_PX_PER_INCH,
};

const BYTES_PER_MEGABYTE = 1024 * 1024;
const MAX_SVG_FILE_MEGABYTES = 10;
export const MAX_SVG_FILE_BYTES = MAX_SVG_FILE_MEGABYTES * BYTES_PER_MEGABYTE;

export const SVG_REMOVED_CONTENT_KIND = {
  FOREIGN_OBJECT: 'foreign-object',
  LINKED_IMAGE: 'linked-image',
  STYLE_URL: 'style-url',
} as const;

export type SvgRemovedContentKind = (typeof SVG_REMOVED_CONTENT_KIND)[keyof typeof SVG_REMOVED_CONTENT_KIND];

export const SVG_IMPORT_ERROR_KIND = {
  NOT_SVG: 'not-svg',
  NO_SIZE: 'no-size',
  TOO_LARGE: 'too-large',
} as const;

export type SvgImportErrorKind = (typeof SVG_IMPORT_ERROR_KIND)[keyof typeof SVG_IMPORT_ERROR_KIND];

export const SVG_MIME_TYPE = 'image/svg+xml';
export const SVG_ROOT_ELEMENT_NAME = 'svg';
export const SVG_PARSER_ERROR_ELEMENT_NAME = 'parsererror';
export const SVG_SCRIPT_ELEMENT_NAME = 'script';
export const SVG_FOREIGN_OBJECT_ELEMENT_NAME = 'foreignobject';
export const SVG_STYLE_ELEMENT_NAME = 'style';
export const SVG_ANCHOR_ELEMENT_NAME = 'a';
export const SVG_ALL_ELEMENTS_SELECTOR = '*';
export const SVG_WIDTH_ATTRIBUTE = 'width';
export const SVG_HEIGHT_ATTRIBUTE = 'height';
export const SVG_VIEW_BOX_ATTRIBUTE = 'viewBox';
export const SVG_HREF_ATTRIBUTE_NAME = 'href';
export const SVG_EVENT_ATTRIBUTE_PREFIX = 'on';
export const SVG_JAVASCRIPT_URL_PREFIX = 'javascript:';
export const SVG_SAME_DOCUMENT_REFERENCE_PREFIX = '#';

export const SVG_LENGTH_PATTERN = /^\s*(\d*\.?\d+(?:e[+-]?\d+)?)\s*([a-z%]*)\s*$/i;
export const SVG_VIEW_BOX_SEPARATOR_PATTERN = /[\s,]+/;
export const SVG_SAFE_DATA_IMAGE_PATTERN = /^data:image\/(?:png|jpeg|gif|webp)[;,]/;
export const SVG_IMPORT_RULE_PATTERN = /@import/i;
export const SVG_REMOTE_URL_PATTERN = /url\(\s*["']?\s*(?![\s"']|data:|#)/i;
export const SVG_VIEW_BOX_VALUE_COUNT = 4;
export const SVG_VIEW_BOX_WIDTH_INDEX = 2;
export const SVG_VIEW_BOX_HEIGHT_INDEX = 3;
