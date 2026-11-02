/**
 * Gets a viewport inside its limits: the zoom between the smallest and the largest, and the view centre on the bed,
 * so the bed can never be panned out of sight.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { MAX_BED_ZOOM, MIN_BED_ZOOM } from './bed.zoom.constants';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewport } from './interfaces/BedViewport';

const getClampedValue = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const getClampedBedViewport = (viewport: BedViewport, dimensions: BedDimensions): BedViewport => ({
  zoom: getClampedValue(viewport.zoom, MIN_BED_ZOOM, MAX_BED_ZOOM),
  centerXMm: getClampedValue(viewport.centerXMm, 0, dimensions.widthMm),
  centerYMm: getClampedValue(viewport.centerYMm, 0, dimensions.heightMm),
});
