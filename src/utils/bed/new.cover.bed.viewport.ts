/**
 * Makes the viewport that fills the whole view with the bed: the bed's shorter side on screen grows until it meets
 * the view, so no wide empty bands stay above and below (or beside) it. The part that no longer fits is cut off at
 * the far side, so the front-left corner, the origin where new objects go, stays in view. Used while a drawer has
 * pushed the bed into a narrow strip.
 *
 * @author michael.morosov
 *
 * @since 2026-11-06
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BED_FIT_MARGIN_PX, BED_VIEW_CENTER_FRACTION } from './bed.zoom.constants';
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import { getClampedBedViewport } from './get.clamped.bed.viewport';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedScreenSize } from './interfaces/BedScreenSize';
import type { BedViewport } from './interfaces/BedViewport';
import { newFitBedViewport } from './new.fit.bed.viewport';

export const newCoverBedViewport = (dimensions: BedDimensions, screenSize: BedScreenSize): BedViewport => {
  const fitViewport: BedViewport = newFitBedViewport(dimensions);
  const fitPixelsPerMm: number = getBedViewPixelsPerMm({ viewport: fitViewport, screenSize, dimensions });

  if (!fitPixelsPerMm) {
    return fitViewport;
  }

  const coverZoom: number = Math.max(
    screenSize.widthPx / dimensions.widthMm,
    screenSize.heightPx / dimensions.heightMm,
  ) / fitPixelsPerMm;
  const zoom: number = getClampedBedViewport({ ...fitViewport, zoom: coverZoom }, dimensions).zoom;
  const pixelsPerMm: number = fitPixelsPerMm * zoom;
  const marginMm: number = BED_FIT_MARGIN_PX / pixelsPerMm;
  const viewWidthMm: number = screenSize.widthPx / pixelsPerMm;
  const viewHeightMm: number = screenSize.heightPx / pixelsPerMm;
  const isWidthCutOff: boolean = viewWidthMm < dimensions.widthMm;
  const isHeightCutOff: boolean = viewHeightMm < dimensions.heightMm;

  return getClampedBedViewport({
    zoom,
    // The left edge sits a margin from the view's left side; the front edge a margin above the view's bottom.
    centerXMm: isWidthCutOff ? viewWidthMm * BED_VIEW_CENTER_FRACTION - marginMm : fitViewport.centerXMm,
    centerYMm: isHeightCutOff
      ? dimensions.heightMm - viewHeightMm * BED_VIEW_CENTER_FRACTION + marginMm
      : fitViewport.centerYMm,
  }, dimensions);
};
