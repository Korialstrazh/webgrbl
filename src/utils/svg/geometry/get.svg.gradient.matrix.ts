/**
 * Gets the matrix from the coordinates of a gradient to root user units: the element matrix, then for object-box units
 * the box of the element in its own user space, then the gradientTransform. Undefined without a gradient, and for an
 * object-box gradient on an element without width or height, which SVG does not paint.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgGradientChain } from './get.svg.gradient.chain';
import { getSvgGradientChainAttribute } from './get.svg.gradient.chain.attribute';
import { getSvgMatrixInverse } from './get.svg.matrix.inverse';
import { getSvgMatrixPoint } from './get.svg.matrix.point';
import { getSvgMatrixProduct } from './get.svg.matrix.product';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgGradientMatrixInput } from './interfaces/SvgGradientMatrixInput';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import type { SvgSubpath } from './interfaces/SvgSubpath';
import { getSvgTransformMatrix } from './parse.svg.transform';
import { SVG_GRADIENT_TRANSFORM_ATTRIBUTE_NAME, SVG_GRADIENT_UNITS } from './svg.geometry.constants';

/** The box of the element in its own user space, as the matrix from object-box fractions to that space. */
const getElementBoxMatrix = (subpaths: SvgSubpath[], elementMatrix: SvgMatrix): SvgMatrix | undefined => {
  const inverseMatrix: SvgMatrix | undefined = getSvgMatrixInverse(elementMatrix);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (!inverseMatrix) {
    return undefined;
  }

  for (const subpath of subpaths) {
    for (const point of subpath.points) {
      const localPoint: GeometryPoint = getSvgMatrixPoint(inverseMatrix, point);

      minX = Math.min(minX, localPoint.x);
      minY = Math.min(minY, localPoint.y);
      maxX = Math.max(maxX, localPoint.x);
      maxY = Math.max(maxY, localPoint.y);
    }
  }

  return maxX > minX && maxY > minY ? { a: maxX - minX, b: 0, c: 0, d: maxY - minY, e: minX, f: minY } : undefined;
};

export const getSvgGradientMatrix = (input: SvgGradientMatrixInput): SvgMatrix | undefined => {
  const { paint, paintValue, elementMatrix, subpaths, elementsById } = input;

  if (!paint?.gradient) {
    return undefined;
  }

  const gradientChain: Element[] = getSvgGradientChain(paintValue, elementsById);
  const gradientTransform: SvgMatrix = getSvgTransformMatrix(
    getSvgGradientChainAttribute(gradientChain, SVG_GRADIENT_TRANSFORM_ATTRIBUTE_NAME),
  );

  if (paint.gradient.units === SVG_GRADIENT_UNITS.USER_SPACE_ON_USE) {
    return getSvgMatrixProduct(elementMatrix, gradientTransform);
  }

  const boxMatrix: SvgMatrix | undefined = getElementBoxMatrix(subpaths, elementMatrix);

  return boxMatrix ? getSvgMatrixProduct(getSvgMatrixProduct(elementMatrix, boxMatrix), gradientTransform) : undefined;
};
