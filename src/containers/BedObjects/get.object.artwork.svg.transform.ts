/**
 * Gets the SVG transform that places an object's design paths, drawn in artwork millimetres at the imported size, in
 * its box around the box centre: moved to the top-left corner and stretched to the box size, as the artwork image is.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { HALF_BOX_FACTOR } from '../../utils/project/project.constants';

/** An artwork with no imported size cannot be stretched, so it keeps its own scale. */
const getArtworkScale = (sizeMm: number, intrinsicSizeMm: number): number =>
  intrinsicSizeMm > 0 ? sizeMm / intrinsicSizeMm : 1;

export const getObjectArtworkSvgTransform = (projectObject: ProjectObject): string => {
  const left: number = -projectObject.widthMm * HALF_BOX_FACTOR;
  const top: number = -projectObject.heightMm * HALF_BOX_FACTOR;
  const scaleX: number = getArtworkScale(projectObject.widthMm, projectObject.intrinsicWidthMm);
  const scaleY: number = getArtworkScale(projectObject.heightMm, projectObject.intrinsicHeightMm);

  return `translate(${left} ${top}) scale(${scaleX} ${scaleY})`;
};
