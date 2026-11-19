/**
 * Gets the viewport that shows the whole bed fitted to the view, centred: the starting view and the Fit button.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BED_VIEW_CENTER_FRACTION } from './bed.zoom.constants';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewport } from './interfaces/BedViewport';

export const newFitBedViewport = ({ widthMm, heightMm }: BedDimensions): BedViewport => ({
  zoom: 1,
  centerXMm: widthMm * BED_VIEW_CENTER_FRACTION,
  centerYMm: heightMm * BED_VIEW_CENTER_FRACTION,
});
