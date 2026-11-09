/**
 * Tells whether any of an object's drawn geometry lies outside the bed. Only the geometry the job burns counts: empty
 * page margins and content turned off in the element tree may hang over the edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import { getObjectArtworkFrame } from '../toolpath/get.object.artwork.frame';
import { getObjectArtworkPlacement } from '../toolpath/get.object.artwork.placement';
import type { ObjectArtworkFrame } from '../toolpath/interfaces/ObjectArtworkFrame';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { isObjectOutsideBed } from './is.object.outside.bed';
import { HALF_BOX_FACTOR, HALF_TURN_DEG } from './project.constants';

/** The artwork box turns around the centre of the whole box, so its own centre moves with the rotation. */
const getRotatedArtworkPlacement = (
  projectObject: ProjectObject,
  artwork: ProjectObjectTransform,
): ProjectObjectTransform => {
  const boxCenterX: number = projectObject.xMm + projectObject.widthMm * HALF_BOX_FACTOR;
  const boxCenterY: number = projectObject.yMm + projectObject.heightMm * HALF_BOX_FACTOR;
  const offsetX: number = artwork.xMm + artwork.widthMm * HALF_BOX_FACTOR - boxCenterX;
  const offsetY: number = artwork.yMm + artwork.heightMm * HALF_BOX_FACTOR - boxCenterY;
  const angleRadians: number = (projectObject.rotationDeg * Math.PI) / HALF_TURN_DEG;
  const rotatedCenterX: number = boxCenterX + offsetX * Math.cos(angleRadians) - offsetY * Math.sin(angleRadians);
  const rotatedCenterY: number = boxCenterY + offsetX * Math.sin(angleRadians) + offsetY * Math.cos(angleRadians);

  return {
    ...artwork,
    xMm: rotatedCenterX - artwork.widthMm * HALF_BOX_FACTOR,
    yMm: rotatedCenterY - artwork.heightMm * HALF_BOX_FACTOR,
  };
};

export const isObjectArtworkOutsideBed = (projectObject: ProjectObject, bed: BedDimensions): boolean => {
  const artworkFrame: ObjectArtworkFrame = getObjectArtworkFrame(projectObject);
  const artworkPlacement: ProjectObjectTransform = getObjectArtworkPlacement(projectObject, artworkFrame);

  return isObjectOutsideBed(getRotatedArtworkPlacement(projectObject, artworkPlacement), bed);
};
