/**
 * Walks an expanded SVG document in document order and turns each shown shape into a drawable in root user units,
 * numbered in paint order. Nested svg elements add their viewport, sized against the viewport they sit in. Content in
 * defs, clip paths, masks, patterns, markers and symbols is not drawn. Shown text and images give no drawables; they,
 * clipped or masked content and a spent use budget are reported once per kind.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgChildElements } from './get.svg.child.elements';
import { getSvgChildPlacement } from './get.svg.child.placement';
import { getSvgCssRules } from './get.svg.css.rules';
import { getSvgElementDrawable } from './get.svg.element.drawable';
import { getSvgElementWarningKinds } from './get.svg.element.warning.kinds';
import { getSvgElementsById } from './get.svg.elements.by.id';
import { getSvgRootViewportSize } from './get.svg.root.viewport.size';
import type { SvgDrawable } from './interfaces/SvgDrawable';
import type { SvgDrawableContext } from './interfaces/SvgDrawableContext';
import type { SvgDrawableSet } from './interfaces/SvgDrawableSet';
import type { SvgDrawableShape } from './interfaces/SvgDrawableShape';
import type { SvgElementPlacement } from './interfaces/SvgElementPlacement';
import type { SvgExpandedDocument } from './interfaces/SvgExpandedDocument';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import type { SvgWarningContext } from './interfaces/SvgWarningContext';
import { getResolvedSvgStyles } from './resolve.svg.styles';
import { SVG_NOT_RENDERED_CONTAINER_NAMES } from './svg.geometry.constants';
import { SVG_CLIPPING_ELEMENT_SELECTOR, SVG_UNSUPPORTED_KIND } from './svg.shape.constants';
import type { SvgUnsupportedKind } from './svg.shape.constants';
import { SVG_IDENTITY_MATRIX } from './svg.transform.constants';

/** False for an undisplayed element and for containers such as defs whose content is only drawn by reference. */
const isElementRendered = (element: Element, style: SvgResolvedStyle | undefined): style is SvgResolvedStyle =>
  Boolean(style?.isDisplayed) && !SVG_NOT_RENDERED_CONTAINER_NAMES.has(element.localName);

/** The drawn children of a placed element, last child first so the first one is taken next. */
const getChildPlacements = (placement: SvgElementPlacement): SvgElementPlacement[] => {
  const childPlacements: SvgElementPlacement[] = [];

  for (const childElement of getSvgChildElements(placement.element).reverse()) {
    const childPlacement: SvgElementPlacement | undefined = getSvgChildPlacement(childElement, placement);

    if (childPlacement) {
      childPlacements.push(childPlacement);
    }
  }

  return childPlacements;
};

const getWarningContext = (svgDocument: Document): SvgWarningContext => ({
  rules: getSvgCssRules(svgDocument),
  hasClippingElements: Boolean(svgDocument.querySelector(SVG_CLIPPING_ELEMENT_SELECTOR)),
});

export const getSvgDocumentDrawables = (expandedDocument: SvgExpandedDocument, tolerance: number): SvgDrawableSet => {
  const { svgDocument, isUseLimitReached } = expandedDocument;
  const resolvedStyles: Map<Element, SvgResolvedStyle> = getResolvedSvgStyles(svgDocument);
  const context: SvgDrawableContext = {
    paintLookup: { elementsById: getSvgElementsById(svgDocument), resolvedStyles },
    tolerance,
  };
  const warningContext: SvgWarningContext = getWarningContext(svgDocument);
  const drawables: SvgDrawable[] = [];
  const warningKinds: Set<SvgUnsupportedKind> = new Set<SvgUnsupportedKind>(
    isUseLimitReached ? [SVG_UNSUPPORTED_KIND.USE_LIMIT] : [],
  );
  // The root's own viewBox and size are placed by the object matrix, so the walk starts in root user units.
  const pendingPlacements: SvgElementPlacement[] = [
    {
      element: svgDocument.documentElement,
      matrix: SVG_IDENTITY_MATRIX,
      viewport: getSvgRootViewportSize(svgDocument.documentElement),
    },
  ];

  for (let placement = pendingPlacements.pop(); placement; placement = pendingPlacements.pop()) {
    const style: SvgResolvedStyle | undefined = resolvedStyles.get(placement.element);

    if (!isElementRendered(placement.element, style)) {
      continue;
    }

    const drawableShape: SvgDrawableShape | undefined = getSvgElementDrawable(placement, context);

    getSvgElementWarningKinds(placement.element, style, warningContext)
      .forEach((warningKind: SvgUnsupportedKind) => warningKinds.add(warningKind));

    if (drawableShape) {
      drawables.push({ ...drawableShape, paintOrder: drawables.length });
    }

    pendingPlacements.push(...getChildPlacements(placement));
  }

  return { drawables, unsupported: Array.from(warningKinds) };
};
