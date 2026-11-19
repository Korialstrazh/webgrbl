/**
 * Gets the bed SVG point under a pointer, from the SVG that holds the objects layer. Undefined while the layer is not
 * mounted or the SVG has no usable screen matrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
