/**
 * Tracks how many screen pixels one bed millimetre takes, so handles can keep a fixed size on screen. It is read when
 * the layer mounts, whenever the bed SVG changes size, and whenever the bed itself changes size. Undefined until then,
 * or while the SVG has no usable screen matrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { getBedSvgPixelsPerMm } from './get.bed.svg.pixels.per.mm';

export const useBedPixelsPerMm = (
  layerRef: RefObject<SVGGElement | null>,
  dimensions: BedDimensions,
): number | undefined => {
  const [pixelsPerMm, setPixelsPerMm] = useState<number | undefined>(undefined);
  const { widthMm, heightMm } = dimensions;

  useLayoutEffect(() => {
    const svgElement: SVGSVGElement | null | undefined = layerRef.current?.ownerSVGElement;

    if (!svgElement) {
      return undefined;
    }

    const updatePixelsPerMm = (): void => {
      setPixelsPerMm(getBedSvgPixelsPerMm(svgElement));
    };
    const resizeObserver: ResizeObserver = new ResizeObserver(updatePixelsPerMm);

    updatePixelsPerMm();
    resizeObserver.observe(svgElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [layerRef, widthMm, heightMm]);

  return pixelsPerMm;
};
