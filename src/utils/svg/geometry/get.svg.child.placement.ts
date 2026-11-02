/**
 * Places a child element under its placed parent: the parent matrix times the child's transform, followed by the
 * viewport of a nested svg, which also gives its content a new viewport. A nested svg with a zero size gives
 * undefined, since it draws nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_ROOT_ELEMENT_NAME } from '../svg.constants';
import { getSvgMatrixProduct } from './get.svg.matrix.product';
import { getSvgNestedViewport } from './get.svg.nested.viewport';
import type { SvgElementPlacement } from './interfaces/SvgElementPlacement';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import type { SvgNestedViewport } from './interfaces/SvgNestedViewport';
import { getSvgTransformMatrix } from './parse.svg.transform';
import { SVG_TRANSFORM_ATTRIBUTE_NAME } from './svg.transform.constants';

export const getSvgChildPlacement = (
  childElement: Element,
  parentPlacement: SvgElementPlacement,
): SvgElementPlacement | undefined => {
  const matrix: SvgMatrix = getSvgMatrixProduct(
    parentPlacement.matrix,
    getSvgTransformMatrix(childElement.getAttribute(SVG_TRANSFORM_ATTRIBUTE_NAME)),
  );

  if (childElement.localName !== SVG_ROOT_ELEMENT_NAME) {
    return { element: childElement, matrix, viewport: parentPlacement.viewport };
  }

  const nestedViewport: SvgNestedViewport | undefined = getSvgNestedViewport(childElement, parentPlacement.viewport);

  return nestedViewport && {
    element: childElement,
    matrix: getSvgMatrixProduct(matrix, nestedViewport.matrix),
    viewport: nestedViewport.contentViewport,
  };
};
