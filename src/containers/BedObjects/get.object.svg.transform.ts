/**
 * Gets the SVG transform that places an object's box on the bed: a move to the box centre, flipped from machine Y (up)
 * to SVG Y (down), then the rotation. A counter-clockwise turn on screen is a negative angle in SVG, whose Y points
 * down.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import { HALF_BOX_FACTOR } from '../../utils/project/project.constants';

export const getObjectSvgTransform = (transform: ProjectObjectTransform, bedHeightMm: number): string => {
  const centerX: number = transform.xMm + transform.widthMm * HALF_BOX_FACTOR;
  const centerY: number = bedHeightMm - (transform.yMm + transform.heightMm * HALF_BOX_FACTOR);

  return `translate(${centerX} ${centerY}) rotate(${-transform.rotationDeg})`;
};
