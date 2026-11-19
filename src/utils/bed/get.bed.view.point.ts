/**
 * Gets the bed point, in the bed SVG frame, under a point of the view, for the zoomed and panned bed. Undefined while
 * the view has no size yet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getBedViewBox } from './get.bed.view.box';
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import type { BedScreenPoint } from './interfaces/BedScreenPoint';
import type { BedViewBox } from './interfaces/BedViewBox';
import type { BedViewPoint } from './interfaces/BedViewPoint';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';

export const getBedViewPoint = (frame: BedViewportFrame, screenPoint: BedScreenPoint): BedViewPoint | undefined => {
  const pixelsPerMm: number = getBedViewPixelsPerMm(frame);

  if (!pixelsPerMm) {
    return undefined;
  }

  const viewBox: BedViewBox = getBedViewBox(frame);

  return { xMm: viewBox.xMm + screenPoint.xPx / pixelsPerMm, yMm: viewBox.yMm + screenPoint.yPx / pixelsPerMm };
};
