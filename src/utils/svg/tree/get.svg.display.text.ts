/**
 * Gets SVG text for drawing an object as an image: turned-off content is hidden by a style rule, as the bed draws it
 * again on its own. Text with nothing turned off comes back unchanged.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_MIME_TYPE, SVG_NAMESPACE_URI, SVG_PARSER_ERROR_ELEMENT_NAME } from '../svg.constants';
import { SVG_STYLE_ELEMENT_NAME, SVG_TREE_DISABLED_ATTRIBUTE_NAME, SVG_TREE_DISABLED_DISPLAY_CSS } from './svg.tree.constants';

export const getSvgDisplayText = (svgText: string): string => {
  if (!svgText.includes(SVG_TREE_DISABLED_ATTRIBUTE_NAME)) {
    return svgText;
  }

  const svgDocument: Document = new DOMParser().parseFromString(svgText, SVG_MIME_TYPE);

  if (svgDocument.getElementsByTagName(SVG_PARSER_ERROR_ELEMENT_NAME).length) {
    return svgText;
  }

  const styleElement: Element = svgDocument.createElementNS(SVG_NAMESPACE_URI, SVG_STYLE_ELEMENT_NAME);

  styleElement.textContent = SVG_TREE_DISABLED_DISPLAY_CSS;
  svgDocument.documentElement.append(styleElement);

  return new XMLSerializer().serializeToString(svgDocument.documentElement);
};
