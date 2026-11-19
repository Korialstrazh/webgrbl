/**
 * Gets the viewport after a pan step: the bed moves with the pointer, and stays on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
