/**
 * Gets the bed SVG point under a pointer, from the SVG that holds the objects layer. Undefined while the layer is not
 * mounted or the SVG has no usable screen matrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PointerEvent } from 'react';
import { getBedSvgPoint } from './get.bed.svg.point';
import type { BedSvgPoint } from './interfaces/BedSvgPoint';

export const getPointerBedSvgPoint = (
  layerElement: SVGGElement | null,
  pointerEvent: PointerEvent,
): BedSvgPoint | undefined => {
  const svgElement: SVGSVGElement | null | undefined = layerElement?.ownerSVGElement;

  return svgElement ? getBedSvgPoint(svgElement, pointerEvent.clientX, pointerEvent.clientY) : undefined;
};
