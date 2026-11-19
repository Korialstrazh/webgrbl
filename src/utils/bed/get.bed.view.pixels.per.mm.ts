/**
 * Gets how many CSS pixels one bed millimetre takes in the view: the scale that fits the whole bed, times the zoom.
 * 0 while the view has no size yet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BED_FIT_MARGIN_PX } from './bed.zoom.constants';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';

const MARGIN_SIDE_COUNT = 2;

/** A screen length less the fit margin on both sides, or the whole length when the margin would not leave room. */
const getFitLengthPx = (screenLengthPx: number): number => {
  const innerLengthPx: number = screenLengthPx - MARGIN_SIDE_COUNT * BED_FIT_MARGIN_PX;

  return innerLengthPx > 0 ? innerLengthPx : screenLengthPx;
};

export const getBedViewPixelsPerMm = ({ viewport, screenSize, dimensions }: BedViewportFrame): number => {
  const fitPixelsPerMm: number = Math.min(
    getFitLengthPx(screenSize.widthPx) / dimensions.widthMm,
    getFitLengthPx(screenSize.heightPx) / dimensions.heightMm,
  );

  return Number.isFinite(fitPixelsPerMm) && fitPixelsPerMm > 0 ? fitPixelsPerMm * viewport.zoom : 0;
};
