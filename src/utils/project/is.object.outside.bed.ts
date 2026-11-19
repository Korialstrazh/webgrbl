/**
 * Tells whether any rotated corner of an object lies outside the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
