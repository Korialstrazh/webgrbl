/**
 * Tells whether a bed viewport shows the bed exactly as Fit does: the fitted zoom and the fitted centre, compared
 * exactly. A view that was panned, or zoomed to a value that only rounds to 100 %, is not fitted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewport } from './interfaces/BedViewport';
import { newFitBedViewport } from './new.fit.bed.viewport';

export const isBedViewportFitted = (viewport: BedViewport, dimensions: BedDimensions): boolean => {
  const fitViewport: BedViewport = newFitBedViewport(dimensions);

  return viewport.zoom === fitViewport.zoom
    && viewport.centerXMm === fitViewport.centerXMm
    && viewport.centerYMm === fitViewport.centerYMm;
};
