/**
 * Gets an object as it is drawn during a handle gesture: with the placement the gesture gives so far, once the pointer
 * has moved far enough to count as a drag.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import type { BedHandleGesture } from './interfaces/BedHandleGesture';

export const getObjectWithHandleGesture = (
  projectObject: ProjectObject,
  handleGesture: BedHandleGesture | undefined,
): ProjectObject => {
  if (!handleGesture?.isMoving) {
    return projectObject;
  }

  return handleGesture.objectId === projectObject.id ? { ...projectObject, ...handleGesture.transform } : projectObject;
};
