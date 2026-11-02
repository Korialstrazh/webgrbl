/**
 * Gets the bed cursor point under a pointer position of the bed view: the bed point in machine coordinates, or
 * undefined when the pointer is off the bed or the view has no size yet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getBedViewPoint } from './get.bed.view.point';
import type { BedCursorPoint } from './interfaces/BedCursorPoint';
import type { BedScreenPoint } from './interfaces/BedScreenPoint';
import type { BedViewPoint } from './interfaces/BedViewPoint';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';

const isBedViewPointOnBed = (point: BedViewPoint, frame: BedViewportFrame): boolean =>
  point.xMm >= 0 && point.xMm <= frame.dimensions.widthMm && point.yMm >= 0 && point.yMm <= frame.dimensions.heightMm;

export const getBedCursorPoint = (frame: BedViewportFrame, screenPoint: BedScreenPoint): BedCursorPoint | undefined => {
  const viewPoint: BedViewPoint | undefined = getBedViewPoint(frame, screenPoint);

  if (!viewPoint || !isBedViewPointOnBed(viewPoint, frame)) {
    return undefined;
  }

  // The bed SVG counts Y down from the back edge; the machine counts it up from the front edge.
  return { xMm: viewPoint.xMm, yMm: frame.dimensions.heightMm - viewPoint.yMm };
};
