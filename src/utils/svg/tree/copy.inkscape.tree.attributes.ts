/**
 * Copies the Inkscape label and layer mode of an element into plain data attributes before import removes all
 * Inkscape attributes, so the element tree can still name layers the way the drawing program did.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  INKSCAPE_GROUP_MODE_ATTRIBUTE_NAME,
  INKSCAPE_LABEL_ATTRIBUTE_NAME,
  INKSCAPE_LAYER_GROUP_MODE,
  INKSCAPE_NAMESPACE_URI,
  SVG_TREE_LABEL_ATTRIBUTE_NAME,
  SVG_TREE_LAYER_ATTRIBUTE_NAME,
  SVG_TREE_LAYER_ATTRIBUTE_VALUE,
} from './svg.tree.constants';

export const copyInkscapeTreeAttributes = (element: Element): void => {
  const label: string | null = element.getAttributeNS(INKSCAPE_NAMESPACE_URI, INKSCAPE_LABEL_ATTRIBUTE_NAME);
  const groupMode: string | null = element.getAttributeNS(INKSCAPE_NAMESPACE_URI, INKSCAPE_GROUP_MODE_ATTRIBUTE_NAME);

  if (label) {
    element.setAttribute(SVG_TREE_LABEL_ATTRIBUTE_NAME, label);
  }

  if (groupMode === INKSCAPE_LAYER_GROUP_MODE) {
    element.setAttribute(SVG_TREE_LAYER_ATTRIBUTE_NAME, SVG_TREE_LAYER_ATTRIBUTE_VALUE);
  }
};
