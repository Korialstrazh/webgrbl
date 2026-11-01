/**
 * Tells whether any rotated corner of an object lies outside the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import { getObjectCorners } from './get.object.corners';
import type { ObjectCornerPoint } from './interfaces/ObjectCornerPoint';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { BED_EDGE_EPSILON_MM } from './project.constants';

const isCornerOutsideBed = (corner: ObjectCornerPoint, bed: BedDimensions): boolean =>
  corner.x < -BED_EDGE_EPSILON_MM
  || corner.y < -BED_EDGE_EPSILON_MM
  || corner.x > bed.widthMm + BED_EDGE_EPSILON_MM
  || corner.y > bed.heightMm + BED_EDGE_EPSILON_MM;

export const isObjectOutsideBed = (projectObject: ProjectObjectTransform, bed: BedDimensions): boolean =>
  getObjectCorners(projectObject).some((corner: ObjectCornerPoint): boolean => isCornerOutsideBed(corner, bed));
