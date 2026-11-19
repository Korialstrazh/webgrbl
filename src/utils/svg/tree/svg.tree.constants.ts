/**
 * Names and values of the element tree of an object's SVG: the markers the app writes into the SVG text, and the
 * element kinds the tree shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
/** Marks an element the job leaves out; it stays in the SVG so it can be turned back on. */
export const SVG_TREE_DISABLED_ATTRIBUTE_NAME = 'data-webgrbl-disabled';
export const SVG_TREE_DISABLED_ATTRIBUTE_VALUE = 'true';
export const SVG_TREE_DISABLED_SELECTOR = `[${SVG_TREE_DISABLED_ATTRIBUTE_NAME}]`;
/** The Inkscape label of an element, kept on import since the Inkscape attribute itself is removed. */
export const SVG_TREE_LABEL_ATTRIBUTE_NAME = 'data-webgrbl-label';
/** Set on an Inkscape layer group on import. */
export const SVG_TREE_LAYER_ATTRIBUTE_NAME = 'data-webgrbl-layer';
export const SVG_TREE_LAYER_ATTRIBUTE_VALUE = 'true';
export const INKSCAPE_NAMESPACE_URI = 'http://www.inkscape.org/namespaces/inkscape';
export const INKSCAPE_LABEL_ATTRIBUTE_NAME = 'label';
export const INKSCAPE_GROUP_MODE_ATTRIBUTE_NAME = 'groupmode';
export const INKSCAPE_LAYER_GROUP_MODE = 'layer';
/** Joins the child indexes of a node path, such as 0.3.1. */
export const SVG_TREE_PATH_SEPARATOR = '.';
/**
 * Hides left-out elements where the SVG is drawn as an image: the bed draws them again on their own, faint, dashed and
 * without the halo, so the image's glow never makes them look like a burn.
 */
export const SVG_TREE_DISABLED_DISPLAY_CSS = `${SVG_TREE_DISABLED_SELECTOR}{display:none}`;
export const SVG_STYLE_ELEMENT_NAME = 'style';
export const SVG_STYLE_DECLARATION_SEPARATOR = ';';
export const SVG_STYLE_PROPERTY_SEPARATOR = ':';
export const SVG_PAINT_NONE = 'none';

export const SVG_TREE_NODE_KIND = {
  LAYER: 'layer',
  GROUP: 'group',
  SHAPE: 'shape',
} as const;

export type SvgTreeNodeKind = (typeof SVG_TREE_NODE_KIND)[keyof typeof SVG_TREE_NODE_KIND];

export const SVG_PAINT_PROPERTY = {
  FILL: 'fill',
  STROKE: 'stroke',
} as const;

export type SvgPaintProperty = (typeof SVG_PAINT_PROPERTY)[keyof typeof SVG_PAINT_PROPERTY];

/** Containers the tree opens. */
export const SVG_TREE_CONTAINER_ELEMENT_NAMES: readonly string[] = ['g', 'a', 'svg', 'switch'];
/** Leaf elements the tree lists: the drawn shapes, plus text, images and uses the job may warn about. */
export const SVG_TREE_SHAPE_ELEMENT_NAMES: readonly string[] = [
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'image',
  'use',
];
export const SVG_TREE_SHAPE_SELECTOR: string = SVG_TREE_SHAPE_ELEMENT_NAMES.join(', ');
