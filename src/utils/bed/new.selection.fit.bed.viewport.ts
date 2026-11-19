/**
 * Gets the viewport that shows the drawings of the selected objects whole, centred, never closer than the fitted
 * bed: used after an import larger than the bed so all of it and its handles are in view.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getObjectArtworkBedBounds } from '../project/get.object.artwork.bed.bounds';
import type { ObjectArtworkBedBounds } from '../project/interfaces/ObjectArtworkBedBounds';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { BED_VIEW_CENTER_FRACTION, MIN_BED_ZOOM } from './bed.zoom.constants';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewport } from './interfaces/BedViewport';

/** The share of the view the selection may fill, so the handles around it stay clear of the view edge. */
const SELECTION_FIT_FILL_SHARE = 0.85;
const FITTED_BED_ZOOM = 1;

export const newSelectionFitBedViewport = (
  selectedObjects: readonly ProjectObject[],
  dimensions: BedDimensions,
): BedViewport | undefined => {
  if (!selectedObjects.length) {
    return undefined;
  }

  const allBounds: ObjectArtworkBedBounds[] = selectedObjects.map(getObjectArtworkBedBounds);
  const minXMm: number = Math.min(...allBounds.map((bounds: ObjectArtworkBedBounds): number => bounds.minXMm));
  const minYMm: number = Math.min(...allBounds.map((bounds: ObjectArtworkBedBounds): number => bounds.minYMm));
  const maxXMm: number = Math.max(...allBounds.map((bounds: ObjectArtworkBedBounds): number => bounds.maxXMm));
  const maxYMm: number = Math.max(...allBounds.map((bounds: ObjectArtworkBedBounds): number => bounds.maxYMm));
  const fitZoom: number = SELECTION_FIT_FILL_SHARE * Math.min(
    dimensions.widthMm / Math.max(maxXMm - minXMm, Number.EPSILON),
    dimensions.heightMm / Math.max(maxYMm - minYMm, Number.EPSILON),
  );

  // The viewport Y runs from the back edge, the object Y from the front edge.
  return {
    zoom: Math.min(FITTED_BED_ZOOM, Math.max(MIN_BED_ZOOM, fitZoom)),
    centerXMm: (minXMm + maxXMm) * BED_VIEW_CENTER_FRACTION,
    centerYMm: dimensions.heightMm - (minYMm + maxYMm) * BED_VIEW_CENTER_FRACTION,
  };
};
