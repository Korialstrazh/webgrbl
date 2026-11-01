/**
 * Finds the distinct paints of the drawn elements of a sanitised SVG: fills and strokes with their colour, opacity
 * and gradient. Paints of none, opacity 0, hidden elements and elements in defs, masks, patterns, markers and
 * symbols are left out; use elements are handled by the geometry code.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getResolvedSvgStyles } from './resolve.svg.styles';
import { getSvgGradient } from './get.svg.gradient';
import type { SvgGreyGradient } from './interfaces/SvgGreyGradient';
import type { SvgPaint } from './interfaces/SvgPaint';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import {
  SVG_DEFAULT_STOP_COLOUR,
  SVG_DRAWN_ELEMENT,
  SVG_DRAWN_ELEMENT_NAMES,
  SVG_ID_ATTRIBUTE_NAME,
  SVG_NOT_RENDERED_ANCESTOR_SELECTOR,
  SVG_OPACITY_ROUNDING_FACTOR,
  SVG_PAINT_NONE,
  SVG_PAINT_URL_PATTERN,
} from './svg.geometry.constants';
import {
  SVG_ALL_ELEMENTS_SELECTOR,
  SVG_MIME_TYPE,
  SVG_PARSER_ERROR_ELEMENT_NAME,
} from '../svg.constants';

const getRoundedOpacity = (opacity: number): number =>
  Math.round(opacity * SVG_OPACITY_ROUNDING_FACTOR) / SVG_OPACITY_ROUNDING_FACTOR;

const getElementsById = (svgDocument: Document): Map<string, Element> => {
  const elementsById: Map<string, Element> = new Map<string, Element>();

  for (const element of Array.from(svgDocument.querySelectorAll(SVG_ALL_ELEMENTS_SELECTOR))) {
    const elementId: string | null = element.getAttribute(SVG_ID_ATTRIBUTE_NAME);

    if (elementId && !elementsById.has(elementId)) {
      elementsById.set(elementId, element);
    }
  }

  return elementsById;
};

const isDrawnElement = (element: Element, style: SvgResolvedStyle | undefined): boolean =>
  SVG_DRAWN_ELEMENT_NAMES.includes(element.localName) &&
  !element.closest(SVG_NOT_RENDERED_ANCESTOR_SELECTOR) &&
  Boolean(style?.isDisplayed) &&
  Boolean(style?.isVisible);

const getPaintOfValue = (
  paintValue: string,
  paintOpacity: number,
  elementsById: Map<string, Element>,
  resolvedStyles: Map<Element, SvgResolvedStyle>,
): SvgPaint | undefined => {
  const roundedOpacity: number = getRoundedOpacity(paintOpacity);

  if (paintValue === SVG_PAINT_NONE || roundedOpacity <= 0) {
    return undefined;
  }

  if (!SVG_PAINT_URL_PATTERN.test(paintValue)) {
    return { colour: paintValue, opacity: roundedOpacity, gradient: undefined };
  }

  const gradient: SvgGreyGradient | undefined = getSvgGradient(paintValue, elementsById, resolvedStyles);

  if (!gradient) {
    return undefined;
  }

  return { colour: gradient.stops[0]?.colour ?? SVG_DEFAULT_STOP_COLOUR, opacity: roundedOpacity, gradient };
};

const getElementPaints = (
  element: Element,
  style: SvgResolvedStyle,
  elementsById: Map<string, Element>,
  resolvedStyles: Map<Element, SvgResolvedStyle>,
): SvgPaint[] => {
  const fillPaint: SvgPaint | undefined =
    element.localName === SVG_DRAWN_ELEMENT.LINE
      ? undefined
      : getPaintOfValue(style.fill, style.opacity * style.fillOpacity * style.fillAlpha, elementsById, resolvedStyles);
  const strokePaint: SvgPaint | undefined =
    style.strokeWidth > 0
      ? getPaintOfValue(
        style.stroke,
        style.opacity * style.strokeOpacity * style.strokeAlpha,
        elementsById,
        resolvedStyles,
      )
      : undefined;

  return [fillPaint, strokePaint].filter((paint: SvgPaint | undefined): paint is SvgPaint => Boolean(paint));
};

const getPaintKey = (paint: SvgPaint): string => JSON.stringify([paint.colour, paint.opacity, paint.gradient]);

export const getSvgPaints = (svgText: string): SvgPaint[] => {
  const svgDocument: Document = new DOMParser().parseFromString(svgText, SVG_MIME_TYPE);

  if (svgDocument.getElementsByTagName(SVG_PARSER_ERROR_ELEMENT_NAME).length) {
    return [];
  }

  const resolvedStyles: Map<Element, SvgResolvedStyle> = getResolvedSvgStyles(svgDocument);
  const elementsById: Map<string, Element> = getElementsById(svgDocument);
  const distinctPaints: Map<string, SvgPaint> = new Map<string, SvgPaint>();

  for (const [element, style] of resolvedStyles) {
    if (isDrawnElement(element, style)) {
      for (const paint of getElementPaints(element, style, elementsById, resolvedStyles)) {
        distinctPaints.set(getPaintKey(paint), paint);
      }
    }
  }

  return Array.from(distinctPaints.values());
};
