/**
 * Walks an SVG document (with its use elements already expanded) in document order and turns each shown shape into a
 * drawable in root user units, numbered in paint order. Content in defs, clip paths, masks, patterns, markers and
 * symbols is not drawn. Shown text and images give no drawables and are reported once per kind.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgElementDrawable } from './get.svg.element.drawable';
import { getSvgElementsById } from './get.svg.elements.by.id';
import { getSvgMatrixProduct } from './get.svg.matrix.product';
import type { SvgDrawable } from './interfaces/SvgDrawable';
import type { SvgDrawableContext } from './interfaces/SvgDrawableContext';
import type { SvgDrawableSet } from './interfaces/SvgDrawableSet';
import type { SvgDrawableShape } from './interfaces/SvgDrawableShape';
import type { SvgElementPlacement } from './interfaces/SvgElementPlacement';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import { getSvgTransformMatrix } from './parse.svg.transform';
import { getResolvedSvgStyles } from './resolve.svg.styles';
import { SVG_NOT_RENDERED_ANCESTOR_SELECTOR } from './svg.geometry.constants';
import { SVG_UNSUPPORTED_ELEMENT_KINDS } from './svg.shape.constants';
import type { SvgUnsupportedKind } from './svg.shape.constants';
import { SVG_IDENTITY_MATRIX, SVG_TRANSFORM_ATTRIBUTE_NAME } from './svg.transform.constants';

const getShownUnsupportedKind = (element: Element, style: SvgResolvedStyle): SvgUnsupportedKind | undefined =>
  style.isDisplayed && style.isVisible ? SVG_UNSUPPORTED_ELEMENT_KINDS.get(element.localName) : undefined;

/** False for an undisplayed element and for containers such as defs whose content is only drawn by reference. */
const isElementRendered = (element: Element, style: SvgResolvedStyle | undefined): style is SvgResolvedStyle =>
  Boolean(style?.isDisplayed) && !element.matches(SVG_NOT_RENDERED_ANCESTOR_SELECTOR);

/** The children of a placed element with their matrices, last child first so the first one is taken next. */
const getChildPlacements = (placement: SvgElementPlacement): SvgElementPlacement[] =>
  Array.from(placement.element.children).reverse().map((childElement: Element): SvgElementPlacement => ({
    element: childElement,
    matrix: getSvgMatrixProduct(
      placement.matrix,
      getSvgTransformMatrix(childElement.getAttribute(SVG_TRANSFORM_ATTRIBUTE_NAME)),
    ),
  }));

export const getSvgDocumentDrawables = (svgDocument: Document, tolerance: number): SvgDrawableSet => {
  const resolvedStyles: Map<Element, SvgResolvedStyle> = getResolvedSvgStyles(svgDocument);
  const context: SvgDrawableContext = {
    paintLookup: { elementsById: getSvgElementsById(svgDocument), resolvedStyles },
    tolerance,
  };
  const drawables: SvgDrawable[] = [];
  const unsupportedKinds: Set<SvgUnsupportedKind> = new Set<SvgUnsupportedKind>();
  // The root's own viewBox and size are placed by the object matrix, so the walk starts in root user units.
  const pendingPlacements: SvgElementPlacement[] = [
    { element: svgDocument.documentElement, matrix: SVG_IDENTITY_MATRIX },
  ];

  for (let placement = pendingPlacements.pop(); placement; placement = pendingPlacements.pop()) {
    const style: SvgResolvedStyle | undefined = resolvedStyles.get(placement.element);

    if (!isElementRendered(placement.element, style)) {
      continue;
    }

    const unsupportedKind: SvgUnsupportedKind | undefined = getShownUnsupportedKind(placement.element, style);
    const drawableShape: SvgDrawableShape | undefined = getSvgElementDrawable(placement, context);

    if (unsupportedKind) {
      unsupportedKinds.add(unsupportedKind);
    }

    if (drawableShape) {
      drawables.push({ ...drawableShape, paintOrder: drawables.length });
    }

    pendingPlacements.push(...getChildPlacements(placement));
  }

  return { drawables, unsupported: Array.from(unsupportedKinds) };
};
