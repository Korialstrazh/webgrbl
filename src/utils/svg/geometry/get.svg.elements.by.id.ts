/**
 * Maps the ids of an SVG document to their elements; when an id repeats, the first element in document order wins, as
 * in a browser.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_ALL_ELEMENTS_SELECTOR } from '../svg.constants';
import { SVG_ID_ATTRIBUTE_NAME } from './svg.geometry.constants';

export const getSvgElementsById = (svgDocument: Document): Map<string, Element> => {
  const elementsById: Map<string, Element> = new Map<string, Element>();

  for (const element of Array.from(svgDocument.querySelectorAll(SVG_ALL_ELEMENTS_SELECTOR))) {
    const elementId: string | null = element.getAttribute(SVG_ID_ATTRIBUTE_NAME);

    if (elementId && !elementsById.has(elementId)) {
      elementsById.set(elementId, element);
    }
  }

  return elementsById;
};
