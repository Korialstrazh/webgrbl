/**
 * The fitted bed at zoom 1, held at the top of the view instead of in its middle: a tall, narrow strip (a drawer has
 * pushed the bed aside) would otherwise leave a wide gap between the ruler at the top and the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BED_FIT_MARGIN_PX, BED_VIEW_CENTER_FRACTION } from './bed.zoom.constants';
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedScreenSize } from './interfaces/BedScreenSize';
import type { BedViewport } from './interfaces/BedViewport';
import { newFitBedViewport } from './new.fit.bed.viewport';

export const newTopFitBedViewport = (dimensions: BedDimensions, screenSize: BedScreenSize): BedViewport => {
  const fitViewport: BedViewport = newFitBedViewport(dimensions);
  const pixelsPerMm: number = getBedViewPixelsPerMm({ viewport: fitViewport, screenSize, dimensions });

  if (!pixelsPerMm) {
    return fitViewport;
  }

  const viewHeightMm: number = screenSize.heightPx / pixelsPerMm;
  const marginMm: number = BED_FIT_MARGIN_PX / pixelsPerMm;

  return { ...fitViewport, centerYMm: viewHeightMm * BED_VIEW_CENTER_FRACTION - marginMm };
};
