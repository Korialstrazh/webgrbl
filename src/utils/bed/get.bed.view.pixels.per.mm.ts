/**
 * Gets how many CSS pixels one bed millimetre takes in the view: the scale that fits the whole bed, times the zoom.
 * 0 while the view has no size yet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedViewportFrame } from './interfaces/BedViewportFrame';

export const getBedViewPixelsPerMm = ({ viewport, screenSize, dimensions }: BedViewportFrame): number => {
  const fitPixelsPerMm: number = Math.min(
    screenSize.widthPx / dimensions.widthMm,
    screenSize.heightPx / dimensions.heightMm,
  );

  return Number.isFinite(fitPixelsPerMm) && fitPixelsPerMm > 0 ? fitPixelsPerMm * viewport.zoom : 0;
};
