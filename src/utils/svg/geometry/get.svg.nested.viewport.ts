/**
 * Gets the viewport a nested svg element (or a used symbol, which is drawn as one) adds. A missing or auto width or
 * height is 100% of the parent viewport, and percentages and x/y resolve against it. The viewBox is fitted into the
 * size by the element's own preserveAspectRatio. A zero or negative size draws nothing and gives undefined.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgMatrixProduct } from './get.svg.matrix.product';
import { getSvgViewportLength } from './get.svg.viewport.length';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import type { SvgNestedViewport } from './interfaces/SvgNestedViewport';
import type { SvgViewportSize } from './interfaces/SvgViewportSize';
import { SVG_SHAPE_ATTRIBUTE } from './svg.shape.constants';
import { SVG_IDENTITY_MATRIX } from './svg.transform.constants';
import { getSvgViewBox } from '../get.svg.view.box';
import { getSvgViewBoxMatrix } from '../get.svg.view.box.matrix';
import type { SvgViewBox } from '../interfaces/SvgViewBox';

const hasViewportArea = (size: SvgViewportSize): boolean => size.width > 0 && size.height > 0;

const getViewportSize = (svgElement: Element, parentViewport: SvgViewportSize): SvgViewportSize => ({
  width: getSvgViewportLength(svgElement.getAttribute(SVG_SHAPE_ATTRIBUTE.WIDTH), parentViewport.width)
    ?? parentViewport.width,
  height: getSvgViewportLength(svgElement.getAttribute(SVG_SHAPE_ATTRIBUTE.HEIGHT), parentViewport.height)
    ?? parentViewport.height,
});

export const getSvgNestedViewport = (
  svgElement: Element,
  parentViewport: SvgViewportSize,
): SvgNestedViewport | undefined => {
  const size: SvgViewportSize = getViewportSize(svgElement, parentViewport);

  if (!hasViewportArea(size)) {
    return undefined;
  }

  const moveMatrix: SvgMatrix = {
    ...SVG_IDENTITY_MATRIX,
    e: getSvgViewportLength(svgElement.getAttribute(SVG_SHAPE_ATTRIBUTE.X), parentViewport.width) ?? 0,
    f: getSvgViewportLength(svgElement.getAttribute(SVG_SHAPE_ATTRIBUTE.Y), parentViewport.height) ?? 0,
  };
  const viewBox: SvgViewBox | undefined = getSvgViewBox(svgElement);

  if (!viewBox) {
    return { matrix: moveMatrix, contentViewport: size };
  }

  return {
    matrix: getSvgMatrixProduct(
      moveMatrix,
      getSvgViewBoxMatrix(viewBox, { widthMm: size.width, heightMm: size.height }),
    ),
    contentViewport: { width: viewBox.width, height: viewBox.height },
  };
};
