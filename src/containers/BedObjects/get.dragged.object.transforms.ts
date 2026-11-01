/**
 * Gets the new placement of every object a finished drag moved, keyed by object id, for one transform action.
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
import { getObjectWithDragOffset } from './get.object.with.drag.offset';
import type { BedObjectDrag } from './interfaces/BedObjectDrag';

export const getDraggedObjectTransforms = (
  projectObjects: ProjectObject[],
  drag: BedObjectDrag,
): Record<string, ProjectObjectTransform> => {
  const transforms: Record<string, ProjectObjectTransform> = {};

  for (const projectObject of projectObjects) {
    if (drag.objectIds.includes(projectObject.id)) {
      const { xMm, yMm, widthMm, heightMm, rotationDeg }: ProjectObject = getObjectWithDragOffset(projectObject, drag);

      transforms[projectObject.id] = { xMm, yMm, widthMm, heightMm, rotationDeg };
    }
  }

  return transforms;
};
