/**
 * Shrinks an object, only when its artwork is larger than the bed, and centres its artwork on the bed, keeping its
 * proportions and turn. The artwork scales around the centre of the object's box, as a corner drag does.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import { getObjectArtworkBedBounds } from './get.object.artwork.bed.bounds';
import type { ObjectArtworkBedBounds } from './interfaces/ObjectArtworkBedBounds';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { HALF_BOX_FACTOR } from './project.constants';

const FULL_SIZE_SCALE = 1;

const getFitScale = (bounds: ObjectArtworkBedBounds, bed: BedDimensions): number =>
  Math.min(
    FULL_SIZE_SCALE,
    bed.widthMm / (bounds.maxXMm - bounds.minXMm),
    bed.heightMm / (bounds.maxYMm - bounds.minYMm),
  );

export const getObjectFittedToBedTransform = (
  projectObject: ProjectObject,
  bed: BedDimensions,
): ProjectObjectTransform => {
  const bounds: ObjectArtworkBedBounds = getObjectArtworkBedBounds(projectObject);
  const scale: number = getFitScale(bounds, bed);
  const { xMm, yMm, widthMm, heightMm, rotationDeg }: ProjectObject = projectObject;
  const boxCenterX: number = xMm + widthMm * HALF_BOX_FACTOR;
  const boxCenterY: number = yMm + heightMm * HALF_BOX_FACTOR;
  const artworkCenterX: number = (bounds.minXMm + bounds.maxXMm) * HALF_BOX_FACTOR;
  const artworkCenterY: number = (bounds.minYMm + bounds.maxYMm) * HALF_BOX_FACTOR;
  // The artwork centre keeps its offset from the box centre, scaled; the box follows the artwork to the bed centre.
  const nextBoxCenterX: number = bed.widthMm * HALF_BOX_FACTOR - (artworkCenterX - boxCenterX) * scale;
  const nextBoxCenterY: number = bed.heightMm * HALF_BOX_FACTOR - (artworkCenterY - boxCenterY) * scale;
  const nextWidthMm: number = widthMm * scale;
  const nextHeightMm: number = heightMm * scale;

  return {
    xMm: nextBoxCenterX - nextWidthMm * HALF_BOX_FACTOR,
    yMm: nextBoxCenterY - nextHeightMm * HALF_BOX_FACTOR,
    widthMm: nextWidthMm,
    heightMm: nextHeightMm,
    rotationDeg,
  };
};
