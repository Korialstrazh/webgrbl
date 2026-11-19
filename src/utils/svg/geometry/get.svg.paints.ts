/**
 * Finds the distinct paints of the drawn elements of a sanitised SVG: fills and strokes with their colour, opacity
 * and gradient. Paints of none, opacity 0, hidden elements and elements in defs, masks, patterns, markers and
 * symbols are left out; use elements count with the paint they give to the content they draw.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgElementPaints } from './get.svg.element.paints';
import { getSvgElementsById } from './get.svg.elements.by.id';
import { getSvgExpandedDocument } from './get.svg.expanded.document';
import type { SvgElementPaints } from './interfaces/SvgElementPaints';
import type { SvgExpandedDocument } from './interfaces/SvgExpandedDocument';
import type { SvgPaint } from './interfaces/SvgPaint';
import type { SvgPaintLookup } from './interfaces/SvgPaintLookup';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import { getResolvedSvgStyles } from './resolve.svg.styles';
import { SVG_DRAWN_ELEMENT_NAMES, SVG_NOT_RENDERED_ANCESTOR_SELECTOR } from './svg.geometry.constants';

const isDrawnElement = (element: Element, style: SvgResolvedStyle | undefined): boolean =>
  SVG_DRAWN_ELEMENT_NAMES.includes(element.localName) &&
  !element.closest(SVG_NOT_RENDERED_ANCESTOR_SELECTOR) &&
  Boolean(style?.isDisplayed) &&
  Boolean(style?.isVisible);

const getElementPaintList = (
  element: Element,
  style: SvgResolvedStyle,
  paintLookup: SvgPaintLookup,
): SvgPaint[] => {
  const { fill, stroke }: SvgElementPaints = getSvgElementPaints(element, style, paintLookup);

  return [fill, stroke].filter((paint: SvgPaint | undefined): paint is SvgPaint => Boolean(paint));
};

const getPaintKey = (paint: SvgPaint): string => JSON.stringify([paint.colour, paint.opacity, paint.gradient]);

export const getSvgPaints = (svgText: string): SvgPaint[] => {
  const expandedDocument: SvgExpandedDocument | undefined = getSvgExpandedDocument(svgText);

  if (!expandedDocument) {
    return [];
  }

  const { svgDocument } = expandedDocument;

  const resolvedStyles: Map<Element, SvgResolvedStyle> = getResolvedSvgStyles(svgDocument);
  const elementsById: Map<string, Element> = getSvgElementsById(svgDocument);
  const paintLookup: SvgPaintLookup = { elementsById, resolvedStyles };
  const distinctPaints: Map<string, SvgPaint> = new Map<string, SvgPaint>();

  for (const [element, style] of resolvedStyles) {
    if (isDrawnElement(element, style)) {
      for (const paint of getElementPaintList(element, style, paintLookup)) {
        distinctPaints.set(getPaintKey(paint), paint);
      }
    }
  }

  return Array.from(distinctPaints.values());
};
