/**
 * The smallest shift that brings an object's artwork fully onto the bed, keeping its size and turn; none when the
 * artwork is larger than the bed, which only Fit to bed can solve.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import { getObjectArtworkBedBounds } from './get.object.artwork.bed.bounds';
import type { ObjectArtworkBedBounds } from './interfaces/ObjectArtworkBedBounds';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';

/** How far an edge range must move to sit inside 0..bedSize; zero when it already does. */
const getShiftIntoRange = (minMm: number, maxMm: number, bedSizeMm: number): number => {
  if (minMm < 0) {
    return -minMm;
  }

  return maxMm > bedSizeMm ? bedSizeMm - maxMm : 0;
};

const isArtworkLargerThanBed = (bounds: ObjectArtworkBedBounds, bed: BedDimensions): boolean =>
  bounds.maxXMm - bounds.minXMm > bed.widthMm || bounds.maxYMm - bounds.minYMm > bed.heightMm;

export const getObjectMovedOntoBedTransform = (
  projectObject: ProjectObject,
  bed: BedDimensions,
): ProjectObjectTransform | undefined => {
  const bounds: ObjectArtworkBedBounds = getObjectArtworkBedBounds(projectObject);

  if (isArtworkLargerThanBed(bounds, bed)) {
    return undefined;
  }

  const { xMm, yMm, widthMm, heightMm, rotationDeg }: ProjectObject = projectObject;

  return {
    xMm: xMm + getShiftIntoRange(bounds.minXMm, bounds.maxXMm, bed.widthMm),
    yMm: yMm + getShiftIntoRange(bounds.minYMm, bounds.maxYMm, bed.heightMm),
    widthMm,
    heightMm,
    rotationDeg,
  };
};
