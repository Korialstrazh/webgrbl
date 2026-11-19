/**
 * Gets how far, in CSS pixels, the bed view moves right while a drawer of the given width slides over its left side:
 * just enough for the left edge of the selection to clear the drawer, and 0 when it already sits clear of it or nothing
 * is selected. The zoom stays.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getObjectCorners } from '../project/get.object.corners';
import type { ObjectCornerPoint } from '../project/interfaces/ObjectCornerPoint';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getBedViewBox } from './get.bed.view.box';
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';

/** The space kept between the drawer edge and the selection, so the selection handles stay clear of it. */
const SELECTION_CLEARANCE_PX = 24;

export const getBedOverlayShiftPx = (
  frame: BedViewportFrame,
  insetPx: number,
  selectedObjects: ProjectObject[],
): number => {
  const pixelsPerMm: number = getBedViewPixelsPerMm(frame);

  if (!pixelsPerMm || insetPx <= 0 || !selectedObjects.length) {
    return 0;
  }

  const selectionLeftMm: number = Math.min(...selectedObjects.flatMap(
    (selectedObject: ProjectObject): number[] =>
      getObjectCorners(selectedObject).map((corner: ObjectCornerPoint): number => corner.x),
  ));
  const selectionLeftPx: number = (selectionLeftMm - getBedViewBox(frame).xMm) * pixelsPerMm;

  return Math.max(0, insetPx + SELECTION_CLEARANCE_PX - selectionLeftPx);
};
