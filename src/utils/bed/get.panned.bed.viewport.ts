/**
 * Gets the viewport after a pan step: the bed moves with the pointer, and stays on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import { getClampedBedViewport } from './get.clamped.bed.viewport';
import type { BedPanRequest } from './interfaces/BedPanRequest';
import type { BedViewport } from './interfaces/BedViewport';

export const getPannedBedViewport = (request: BedPanRequest): BedViewport => {
  const { viewport, dimensions, pointerDelta } = request;
  const pixelsPerMm: number = getBedViewPixelsPerMm(request);

  if (!pixelsPerMm) {
    return viewport;
  }

  return getClampedBedViewport({
    zoom: viewport.zoom,
    centerXMm: viewport.centerXMm - pointerDelta.xPx / pixelsPerMm,
    centerYMm: viewport.centerYMm - pointerDelta.yPx / pixelsPerMm,
  }, dimensions);
};
