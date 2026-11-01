/**
 * Gets how many screen pixels one bed millimetre takes, from the bed SVG's screen matrix. Undefined while the SVG is
 * not on screen or is drawn with zero size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
