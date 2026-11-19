/**
 * Where an object's artwork box sits once the object is turned: the artwork box turns around the centre of the whole
 * box, so its own centre moves with the rotation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { HALF_BOX_FACTOR, HALF_TURN_DEG } from './project.constants';

export const getRotatedArtworkPlacement = (
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
