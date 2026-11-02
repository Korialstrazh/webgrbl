/**
 * Gets the viewport after a zoom step: the bed grows or shrinks by the factor, within the zoom limits, while the bed
 * point under the anchor (the pointer, or the view centre for the buttons and keys) stays where it is.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BED_VIEW_CENTER_FRACTION } from './bed.zoom.constants';
import { getBedViewPoint } from './get.bed.view.point';
import { getBedViewPixelsPerMm } from './get.bed.view.pixels.per.mm';
import { getClampedBedViewport } from './get.clamped.bed.viewport';
import type { BedViewPoint } from './interfaces/BedViewPoint';
import type { BedViewport } from './interfaces/BedViewport';
import type { BedZoomRequest } from './interfaces/BedZoomRequest';

export const getZoomedBedViewport = (request: BedZoomRequest): BedViewport => {
  const { viewport, screenSize, dimensions, anchorPoint, zoomFactor } = request;
  const anchorBedPoint: BedViewPoint | undefined = getBedViewPoint(request, anchorPoint);
  const zoomedViewport: BedViewport =
    getClampedBedViewport({ ...viewport, zoom: viewport.zoom * zoomFactor }, dimensions);
  const zoomedPixelsPerMm: number = getBedViewPixelsPerMm({ viewport: zoomedViewport, screenSize, dimensions });

  if (!anchorBedPoint || !zoomedPixelsPerMm) {
    return zoomedViewport;
  }

  // The anchor keeps its bed point: the new centre is that point plus the anchor's distance from the view centre.
  const anchorOffsetXPx: number = screenSize.widthPx * BED_VIEW_CENTER_FRACTION - anchorPoint.xPx;
  const anchorOffsetYPx: number = screenSize.heightPx * BED_VIEW_CENTER_FRACTION - anchorPoint.yPx;

  return getClampedBedViewport({
    zoom: zoomedViewport.zoom,
    centerXMm: anchorBedPoint.xMm + anchorOffsetXPx / zoomedPixelsPerMm,
    centerYMm: anchorBedPoint.yMm + anchorOffsetYPx / zoomedPixelsPerMm,
  }, dimensions);
};
