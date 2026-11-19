/**
 * Gets the bed SVG point under a pointer, by applying the inverse of the SVG's screen matrix to the pointer's screen
 * position. Undefined while the SVG is not on screen and has no matrix, or when the matrix cannot be inverted (a bed
 * drawn with zero size), which gives a point that is not a number.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedSvgPoint } from './interfaces/BedSvgPoint';

const isBedSvgPointFinite = (point: BedSvgPoint): boolean => Number.isFinite(point.x) && Number.isFinite(point.y);

export const getBedSvgPoint = (
  svgElement: SVGSVGElement,
  clientX: number,
  clientY: number,
): BedSvgPoint | undefined => {
  const screenToSvgMatrix: DOMMatrix | undefined = svgElement.getScreenCTM()?.inverse();

  if (!screenToSvgMatrix) {
    return undefined;
  }

  // The matrix is applied by hand instead of through DOMPoint.matrixTransform, which jsdom does not have.
  const point: BedSvgPoint = {
    x: screenToSvgMatrix.a * clientX + screenToSvgMatrix.c * clientY + screenToSvgMatrix.e,
    y: screenToSvgMatrix.b * clientX + screenToSvgMatrix.d * clientY + screenToSvgMatrix.f,
  };

  return isBedSvgPointFinite(point) ? point : undefined;
};
