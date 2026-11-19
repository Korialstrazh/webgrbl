/**
 * Gets the viewBox of the bed drawing for a viewport. It has the shape of the view, so a zoomed bed fills the whole
 * view instead of a box with the bed's shape; while the view has no size yet it is the whole bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BED_VIEW_CENTER_FRACTION } from './bed.zoom.constants';
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import type { BedViewBox } from './interfaces/BedViewBox';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';

export const getBedViewBox = (frame: BedViewportFrame): BedViewBox => {
  const { viewport, screenSize, dimensions } = frame;
  const pixelsPerMm: number = getBedViewPixelsPerMm(frame);

  if (!pixelsPerMm) {
    return { xMm: 0, yMm: 0, widthMm: dimensions.widthMm, heightMm: dimensions.heightMm };
  }

  const widthMm: number = screenSize.widthPx / pixelsPerMm;
  const heightMm: number = screenSize.heightPx / pixelsPerMm;

  return {
    xMm: viewport.centerXMm - widthMm * BED_VIEW_CENTER_FRACTION,
    yMm: viewport.centerYMm - heightMm * BED_VIEW_CENTER_FRACTION,
    widthMm,
    heightMm,
  };
};
