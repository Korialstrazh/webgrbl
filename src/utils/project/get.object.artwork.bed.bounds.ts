/**
 * The box around an object's drawn artwork on the bed after its rotation, the same geometry the off-bed check reads.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getObjectArtworkFrame } from '../toolpath/get.object.artwork.frame';
import { getObjectArtworkPlacement } from '../toolpath/get.object.artwork.placement';
import { getObjectCorners } from './get.object.corners';
import { getRotatedArtworkPlacement } from './get.rotated.artwork.placement';
import type { ObjectArtworkBedBounds } from './interfaces/ObjectArtworkBedBounds';
import type { ObjectCornerPoint } from './interfaces/ObjectCornerPoint';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';

export const getObjectArtworkBedBounds = (projectObject: ProjectObject): ObjectArtworkBedBounds => {
  const artworkPlacement: ProjectObjectTransform =
    getObjectArtworkPlacement(projectObject, getObjectArtworkFrame(projectObject));
  const corners: ObjectCornerPoint[] = getObjectCorners(getRotatedArtworkPlacement(projectObject, artworkPlacement));
  const cornerXs: number[] = corners.map((corner: ObjectCornerPoint): number => corner.x);
  const cornerYs: number[] = corners.map((corner: ObjectCornerPoint): number => corner.y);

  return {
    minXMm: Math.min(...cornerXs),
    minYMm: Math.min(...cornerYs),
    maxXMm: Math.max(...cornerXs),
    maxYMm: Math.max(...cornerYs),
  };
};
