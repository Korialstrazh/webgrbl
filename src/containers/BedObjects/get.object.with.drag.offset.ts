/**
 * Gets an object as it is drawn during a drag: moved by the drag offset when the drag moves it. SVG Y points down, so
 * a pointer moving down on screen lowers the machine Y.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import type { BedObjectDrag } from './interfaces/BedObjectDrag';

export const getObjectWithDragOffset = (
  projectObject: ProjectObject,
  drag: BedObjectDrag | undefined,
): ProjectObject => {
  if (!drag?.isMoving) {
    return projectObject;
  }

  if (!drag.objectIds.includes(projectObject.id)) {
    return projectObject;
  }

  return { ...projectObject, xMm: projectObject.xMm + drag.offset.x, yMm: projectObject.yMm - drag.offset.y };
};
