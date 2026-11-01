/**
 * Gets the matrix a nested svg element (or a used symbol, which is drawn as one) adds for its viewport: the move to
 * its x and y, then its viewBox fitted into its width and height by its own preserveAspectRatio. A missing width or
 * height follows the viewBox aspect ratio; with neither, the viewBox size is used.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgLengthUserUnits } from './get.svg.length.user.units';
import { getSvgMatrixProduct } from './get.svg.matrix.product';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import { SVG_SHAPE_ATTRIBUTE } from './svg.shape.constants';
import { SVG_IDENTITY_MATRIX } from './svg.transform.constants';
import { getSvgViewBox } from '../get.svg.view.box';
import { getSvgViewBoxMatrix } from '../get.svg.view.box.matrix';
import type { SvgPhysicalSize } from '../interfaces/SvgPhysicalSize';
import type { SvgViewBox } from '../interfaces/SvgViewBox';

const getLength = (element: Element, attributeName: string): number =>
  getSvgLengthUserUnits(element.getAttribute(attributeName) ?? undefined, 0);

/** The viewport size in the parent's user units (the field names say mm, as the shared size type does). */
const getViewportSize = (svgElement: Element, viewBox: SvgViewBox): SvgPhysicalSize => {
  const width: number = getLength(svgElement, SVG_SHAPE_ATTRIBUTE.WIDTH);
  const height: number = getLength(svgElement, SVG_SHAPE_ATTRIBUTE.HEIGHT);

  if (width > 0) {
    return { widthMm: width, heightMm: height > 0 ? height : (width * viewBox.height) / viewBox.width };
  }

  if (height > 0) {
    return { widthMm: (height * viewBox.width) / viewBox.height, heightMm: height };
  }

  return { widthMm: viewBox.width, heightMm: viewBox.height };
};

export const getSvgNestedViewportMatrix = (svgElement: Element): SvgMatrix => {
  const moveMatrix: SvgMatrix = {
    ...SVG_IDENTITY_MATRIX,
    e: getLength(svgElement, SVG_SHAPE_ATTRIBUTE.X),
    f: getLength(svgElement, SVG_SHAPE_ATTRIBUTE.Y),
  };
  const viewBox: SvgViewBox | undefined = getSvgViewBox(svgElement);

  if (!viewBox) {
    return moveMatrix;
  }

  return getSvgMatrixProduct(moveMatrix, getSvgViewBoxMatrix(viewBox, getViewportSize(svgElement, viewBox)));
};
