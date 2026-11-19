/**
 * Gets the objects with one object's SVG text replaced, or undefined when that object is missing or already has the
 * text, so no empty undo step is stored.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from './interfaces/ProjectObject';

export const getObjectsWithSvgText = (
  projectObjects: ProjectObject[],
  objectId: string,
  svgText: string,
): ProjectObject[] | undefined => {
  const hasChange: boolean = projectObjects.some(
    (projectObject: ProjectObject): boolean => projectObject.id === objectId && projectObject.svgText !== svgText,
  );

  return hasChange
    ? projectObjects.map((projectObject: ProjectObject): ProjectObject =>
      projectObject.id === objectId ? { ...projectObject, svgText } : projectObject)
    : undefined;
};
