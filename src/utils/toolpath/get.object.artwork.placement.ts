/**
 * Gives an object's placement as the user sees it: the position (front-left corner, unrotated) and size of its drawn
 * geometry rather than of its SVG page, so the Objects list and fields match the job size and the selection box.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObjectTransform } from '../project/interfaces/ProjectObjectTransform';
import type { ObjectArtworkFrame } from './interfaces/ObjectArtworkFrame';

export const getObjectArtworkPlacement = (
  boxPlacement: ProjectObjectTransform,
  artworkFrame: ObjectArtworkFrame,
): ProjectObjectTransform => {
  const bottomFraction: number = 1 - artworkFrame.topFraction - artworkFrame.heightFraction;

  return {
    xMm: boxPlacement.xMm + artworkFrame.leftFraction * boxPlacement.widthMm,
    yMm: boxPlacement.yMm + bottomFraction * boxPlacement.heightMm,
    widthMm: boxPlacement.widthMm * artworkFrame.widthFraction,
    heightMm: boxPlacement.heightMm * artworkFrame.heightFraction,
    rotationDeg: boxPlacement.rotationDeg,
  };
};
