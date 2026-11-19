/**
 * Tells whether a bed viewport shows the bed exactly as Fit does: the fitted zoom and the fitted centre, compared
 * exactly. A view that was panned, or zoomed to a value that only rounds to 100 %, is not fitted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
