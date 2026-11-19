/**
 * Gets SVG text after one change to the element at a node path. A stale path or unreadable text returns the text
 * unchanged.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_MIME_TYPE, SVG_PARSER_ERROR_ELEMENT_NAME } from '../svg.constants';
import { getSvgTreeElementByPath } from './get.svg.tree.element.by.path';
import type { SvgTreeElementEdit } from './interfaces/SvgTreeElementEdit';

export const getSvgTextWithElementEdit = (
  svgText: string,
  nodePath: string,
  editElement: SvgTreeElementEdit,
): string => {
  const svgDocument: Document = new DOMParser().parseFromString(svgText, SVG_MIME_TYPE);

  if (svgDocument.getElementsByTagName(SVG_PARSER_ERROR_ELEMENT_NAME).length) {
    return svgText;
  }

  const element: Element | undefined = getSvgTreeElementByPath(svgDocument, nodePath);

  if (!element || element === svgDocument.documentElement) {
    return svgText;
  }

  editElement(element, svgDocument);

  return new XMLSerializer().serializeToString(svgDocument.documentElement);
};
