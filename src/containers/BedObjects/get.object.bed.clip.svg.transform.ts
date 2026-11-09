/**
 * Gets the inverse of an object's bed transform, which places the bed rectangle in the object's own space, so a clip
 * drawn inside the object can stop its content at the bed edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import { HALF_BOX_FACTOR } from '../../utils/project/project.constants';

export const getObjectBedClipSvgTransform = (transform: ProjectObjectTransform, bedHeightMm: number): string => {
  const centerX: number = transform.xMm + transform.widthMm * HALF_BOX_FACTOR;
  const centerY: number = bedHeightMm - (transform.yMm + transform.heightMm * HALF_BOX_FACTOR);

  return `rotate(${transform.rotationDeg}) translate(${-centerX} ${-centerY})`;
};
