/**
 * Turns SVG text into drawables: every shown shape flattened to line segments within the tolerance, in root user units
 * after the element transforms, numbered in document order. Use elements draw what they point to. Text and images give
 * no drawables and are reported as unsupported once per kind. Unreadable text gives nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgDocumentDrawables } from './get.svg.document.drawables';
import { getSvgExpandedDocument } from './get.svg.expanded.document';
import type { SvgDrawableSet } from './interfaces/SvgDrawableSet';

export const getSvgDrawables = (svgText: string, toleranceUserUnits: number): SvgDrawableSet => {
  const svgDocument: Document | undefined = getSvgExpandedDocument(svgText);

  return svgDocument
    ? getSvgDocumentDrawables(svgDocument, toleranceUserUnits)
    : { drawables: [], unsupported: [] };
};
