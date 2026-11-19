/**
 * The box around an object's drawn artwork on the bed after its rotation, the same geometry the off-bed check reads.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
