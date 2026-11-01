/**
 * Gets the bed SVG point under a pointer, by applying the inverse of the SVG's screen matrix to the pointer's screen
 * position. Undefined while the SVG is not on screen and has no matrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedSvgPoint } from './interfaces/BedSvgPoint';

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
  return {
    x: screenToSvgMatrix.a * clientX + screenToSvgMatrix.c * clientY + screenToSvgMatrix.e,
    y: screenToSvgMatrix.b * clientX + screenToSvgMatrix.d * clientY + screenToSvgMatrix.f,
  };
};
