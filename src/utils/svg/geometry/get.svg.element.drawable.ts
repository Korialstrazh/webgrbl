/**
 * Turns one SVG element into a drawable shape: its flattened outline through its matrix and its fill and stroke. Gives
 * undefined for an element that is not a shape, is not displayed, is hidden, paints nothing or has an empty outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgElementPaints } from './get.svg.element.paints';
import { getSvgGradientMatrix } from './get.svg.gradient.matrix';
import { getSvgMatrixAreaScale } from './get.svg.matrix.area.scale';
import { getSvgShapeSubpaths } from './get.svg.shape.subpaths';
import type { SvgDrawableContext } from './interfaces/SvgDrawableContext';
import type { SvgDrawableShape } from './interfaces/SvgDrawableShape';
import type { SvgElementPaints } from './interfaces/SvgElementPaints';
import type { SvgElementPlacement } from './interfaces/SvgElementPlacement';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import type { SvgSubpath } from './interfaces/SvgSubpath';
import { SVG_DRAWN_ELEMENT_NAMES } from './svg.geometry.constants';

const isShownShape = (element: Element, style: SvgResolvedStyle | undefined): style is SvgResolvedStyle =>
  SVG_DRAWN_ELEMENT_NAMES.includes(element.localName) && Boolean(style?.isDisplayed && style.isVisible);

const hasVisiblePaint = (paints: SvgElementPaints): boolean => Boolean(paints.fill || paints.stroke);

export const getSvgElementDrawable = (
  placement: SvgElementPlacement,
  context: SvgDrawableContext,
): SvgDrawableShape | undefined => {
  const { element, matrix } = placement;
  const style: SvgResolvedStyle | undefined = context.paintLookup.resolvedStyles.get(element);

  if (!isShownShape(element, style)) {
    return undefined;
  }

  const paints: SvgElementPaints = getSvgElementPaints(element, style, context.paintLookup);

  if (!hasVisiblePaint(paints)) {
    return undefined;
  }

  const subpaths: SvgSubpath[] = getSvgShapeSubpaths(element, matrix, context.tolerance);

  if (!subpaths.length) {
    return undefined;
  }

  const { elementsById } = context.paintLookup;

  return {
    subpaths,
    paint: {
      ...paints,
      strokeWidth: style.strokeWidth * getSvgMatrixAreaScale(matrix),
      fillRule: style.fillRule,
      fillGradientMatrix: getSvgGradientMatrix({
        paint: paints.fill,
        paintValue: style.fill,
        elementMatrix: matrix,
        subpaths,
        elementsById,
      }),
      strokeGradientMatrix: getSvgGradientMatrix({
        paint: paints.stroke,
        paintValue: style.stroke,
        elementMatrix: matrix,
        subpaths,
        elementsById,
      }),
    },
  };
};
