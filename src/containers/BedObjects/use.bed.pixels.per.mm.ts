/**
 * Tracks how many screen pixels one bed millimetre takes, so handles can keep a fixed size on screen. It is read when
 * the layer mounts, whenever the bed SVG changes size or view box (the bed zoom and pan), and whenever the bed itself
 * changes size. Undefined until then, or while the SVG has no usable screen matrix.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { getBedSvgPixelsPerMm } from './get.bed.svg.pixels.per.mm';

const VIEW_BOX_ATTRIBUTE = 'viewBox';

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
    const viewBoxObserver: MutationObserver = new MutationObserver(updatePixelsPerMm);

    updatePixelsPerMm();
    resizeObserver.observe(svgElement);
    viewBoxObserver.observe(svgElement, { attributes: true, attributeFilter: [VIEW_BOX_ATTRIBUTE] });

    return () => {
      resizeObserver.disconnect();
      viewBoxObserver.disconnect();
    };
  }, [layerRef, widthMm, heightMm]);

  return pixelsPerMm;
};
