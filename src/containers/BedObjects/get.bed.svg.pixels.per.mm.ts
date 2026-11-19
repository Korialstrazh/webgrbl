/**
 * Gets how many screen pixels one bed millimetre takes, from the bed SVG's screen matrix. Undefined while the SVG is
 * not on screen or is drawn with zero size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
const isUsablePixelsPerMm = (pixelsPerMm: number): boolean => Number.isFinite(pixelsPerMm) && pixelsPerMm > 0;

export const getBedSvgPixelsPerMm = (svgElement: SVGSVGElement): number | undefined => {
  const svgToScreenMatrix: DOMMatrix | null = svgElement.getScreenCTM();

  if (!svgToScreenMatrix) {
    return undefined;
  }

  // The length of the matrix's X axis is the scale, also when the bed is drawn turned.
  const pixelsPerMm: number = Math.hypot(svgToScreenMatrix.a, svgToScreenMatrix.b);

  return isUsablePixelsPerMm(pixelsPerMm) ? pixelsPerMm : undefined;
};
