/**
 * Tells whether any of an object's drawn geometry lies outside the bed. Only the geometry the job burns counts: empty
 * page margins and content turned off in the element tree may hang over the edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import { getObjectArtworkFrame } from '../toolpath/get.object.artwork.frame';
import { getObjectArtworkPlacement } from '../toolpath/get.object.artwork.placement';
import type { ObjectArtworkFrame } from '../toolpath/interfaces/ObjectArtworkFrame';
import { getRotatedArtworkPlacement } from './get.rotated.artwork.placement';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { isObjectOutsideBed } from './is.object.outside.bed';

export const isObjectArtworkOutsideBed = (projectObject: ProjectObject, bed: BedDimensions): boolean => {
  const artworkFrame: ObjectArtworkFrame = getObjectArtworkFrame(projectObject);
  const artworkPlacement: ProjectObjectTransform = getObjectArtworkPlacement(projectObject, artworkFrame);

  return isObjectOutsideBed(getRotatedArtworkPlacement(projectObject, artworkPlacement), bed);
};
