/**
 * Gets an object with the position, size and rotation of its entry in a set of transforms by object id. The object
 * itself comes back when it has no entry or the entry changes nothing, so an unchanged object keeps its identity.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObjectTransformsPayload } from '../states/interfaces/ProjectObjectTransformsPayload';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';

const getTransformFields = (transform: ProjectObjectTransform): ProjectObjectTransform => ({
  xMm: transform.xMm,
  yMm: transform.yMm,
  widthMm: transform.widthMm,
  heightMm: transform.heightMm,
  rotationDeg: transform.rotationDeg,
});

const isTransformEqualToObject = (projectObject: ProjectObject, transform: ProjectObjectTransform): boolean =>
  projectObject.xMm === transform.xMm
  && projectObject.yMm === transform.yMm
  && projectObject.widthMm === transform.widthMm
  && projectObject.heightMm === transform.heightMm
  && projectObject.rotationDeg === transform.rotationDeg;

export const getObjectWithTransform = (
  projectObject: ProjectObject,
  transforms: ProjectObjectTransformsPayload['transforms'],
): ProjectObject => {
  const transform: ProjectObjectTransform | undefined = Object.hasOwn(transforms, projectObject.id)
    ? transforms[projectObject.id]
    : undefined;

  if (!transform || isTransformEqualToObject(projectObject, transform)) {
    return projectObject;
  }

  return { ...projectObject, ...getTransformFields(transform) };
};
