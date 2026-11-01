/**
 * Gets the new placement of every given object moved by one nudge, keyed by object id, for one transform action.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';

export const getNudgedObjectTransforms = (
  projectObjects: ProjectObject[],
  nudgeOffset: BedMachinePoint,
): Record<string, ProjectObjectTransform> => {
  const transforms: Record<string, ProjectObjectTransform> = {};

  for (const { id, xMm, yMm, widthMm, heightMm, rotationDeg } of projectObjects) {
    transforms[id] = { xMm: xMm + nudgeOffset.x, yMm: yMm + nudgeOffset.y, widthMm, heightMm, rotationDeg };
  }

  return transforms;
};
