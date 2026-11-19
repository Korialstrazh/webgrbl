/**
 * Creates the viewport that shows the whole bed and every object at once, parts off the bed included, so an import
 * far larger than the bed or placed beside it can be found. With every object on the bed it is the fitted bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getObjectArtworkBedBounds } from '../project/get.object.artwork.bed.bounds';
import type { ObjectArtworkBedBounds } from '../project/interfaces/ObjectArtworkBedBounds';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { BED_VIEW_CENTER_FRACTION, MIN_BED_ZOOM } from './bed.zoom.constants';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewport } from './interfaces/BedViewport';

const FITTED_BED_ZOOM = 1;

export const newAllObjectsFitBedViewport = (
  projectObjects: readonly ProjectObject[],
  dimensions: BedDimensions,
): BedViewport => {
  const bedBounds: ObjectArtworkBedBounds = {
    minXMm: 0,
    minYMm: 0,
    maxXMm: dimensions.widthMm,
    maxYMm: dimensions.heightMm,
  };
  const allBounds: ObjectArtworkBedBounds[] = [bedBounds, ...projectObjects.map(getObjectArtworkBedBounds)];
  const minXMm: number = Math.min(...allBounds.map((bounds: ObjectArtworkBedBounds): number => bounds.minXMm));
  const minYMm: number = Math.min(...allBounds.map((bounds: ObjectArtworkBedBounds): number => bounds.minYMm));
  const maxXMm: number = Math.max(...allBounds.map((bounds: ObjectArtworkBedBounds): number => bounds.maxXMm));
  const maxYMm: number = Math.max(...allBounds.map((bounds: ObjectArtworkBedBounds): number => bounds.maxYMm));
  const fitZoom: number = Math.min(
    dimensions.widthMm / (maxXMm - minXMm),
    dimensions.heightMm / (maxYMm - minYMm),
  );

  // The viewport Y runs from the back edge, the object Y from the front edge.
  return {
    zoom: Math.min(FITTED_BED_ZOOM, Math.max(MIN_BED_ZOOM, fitZoom)),
    centerXMm: (minXMm + maxXMm) * BED_VIEW_CENTER_FRACTION,
    centerYMm: dimensions.heightMm - (minYMm + maxYMm) * BED_VIEW_CENTER_FRACTION,
  };
};
