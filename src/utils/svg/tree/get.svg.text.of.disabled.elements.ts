/**
 * Gets SVG text that draws only the turned-off content of an object, for the dimmed look on the bed, or undefined
 * when nothing is turned off.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_MIME_TYPE, SVG_PARSER_ERROR_ELEMENT_NAME } from '../svg.constants';
import { SVG_TREE_DISABLED_ATTRIBUTE_NAME, SVG_TREE_DISABLED_SELECTOR, SVG_TREE_SHAPE_SELECTOR } from './svg.tree.constants';

export const getSvgTextOfDisabledElements = (svgText: string): string | undefined => {
  const svgDocument: Document = new DOMParser().parseFromString(svgText, SVG_MIME_TYPE);
  const disabledElements: Element[] = Array.from(svgDocument.querySelectorAll(SVG_TREE_DISABLED_SELECTOR));

  if (!disabledElements.length || svgDocument.getElementsByTagName(SVG_PARSER_ERROR_ELEMENT_NAME).length) {
    return undefined;
  }

  for (const shapeElement of Array.from(svgDocument.querySelectorAll(SVG_TREE_SHAPE_SELECTOR))) {
    if (!shapeElement.closest(SVG_TREE_DISABLED_SELECTOR)) {
      shapeElement.remove();
    }
  }

  for (const disabledElement of disabledElements) {
    disabledElement.removeAttribute(SVG_TREE_DISABLED_ATTRIBUTE_NAME);
  }

  return new XMLSerializer().serializeToString(svgDocument.documentElement);
};
