/**
 * Gets the matrix from an element's content to its parent's user units: its transform, followed by the viewport of a
 * nested svg.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgMatrixProduct } from './get.svg.matrix.product';
import { getSvgNestedViewportMatrix } from './get.svg.nested.viewport.matrix';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import { getSvgTransformMatrix } from './parse.svg.transform';
import { SVG_TRANSFORM_ATTRIBUTE_NAME } from './svg.transform.constants';
import { SVG_ROOT_ELEMENT_NAME } from '../svg.constants';

export const getSvgElementLocalMatrix = (element: Element): SvgMatrix => {
  const transformMatrix: SvgMatrix = getSvgTransformMatrix(element.getAttribute(SVG_TRANSFORM_ATTRIBUTE_NAME));

  return element.localName === SVG_ROOT_ELEMENT_NAME
    ? getSvgMatrixProduct(transformMatrix, getSvgNestedViewportMatrix(element))
    : transformMatrix;
};
