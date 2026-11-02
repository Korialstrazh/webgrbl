/**
 * Gets the viewport that shows the whole bed fitted to the view, centred: the starting view and the Fit button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BED_VIEW_CENTER_FRACTION } from './bed.zoom.constants';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewport } from './interfaces/BedViewport';

export const newFitBedViewport = ({ widthMm, heightMm }: BedDimensions): BedViewport => ({
  zoom: 1,
  centerXMm: widthMm * BED_VIEW_CENTER_FRACTION,
  centerYMm: heightMm * BED_VIEW_CENTER_FRACTION,
});
