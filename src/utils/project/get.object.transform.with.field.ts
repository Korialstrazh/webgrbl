/**
 * Gets the placement of an object after one of its fields is set. Width and height stay in the allowed size range,
 * and with the ratio locked the other side scales by the same factor. Rotation is turned into the range from 0
 * (included) to 360 (excluded).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getClampedObjectSizeMm } from './get.clamped.object.size.mm';
import { getNormalizedRotationDeg } from './get.normalized.rotation.deg';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';

const getObjectPlacement = (projectObject: ProjectObject): ProjectObjectTransform => ({
  xMm: projectObject.xMm,
  yMm: projectObject.yMm,
  widthMm: projectObject.widthMm,
  heightMm: projectObject.heightMm,
  rotationDeg: projectObject.rotationDeg,
});

const getScaledSizeMm = (currentSizeMm: number, newOtherSizeMm: number, currentOtherSizeMm: number): number =>
  getClampedObjectSizeMm(currentSizeMm * (newOtherSizeMm / currentOtherSizeMm));

export const getObjectTransformWithField = (
  projectObject: ProjectObject,
  field: keyof ProjectObjectTransform,
  fieldValue: number,
  isRatioLocked: boolean,
): ProjectObjectTransform => {
  const placement: ProjectObjectTransform = getObjectPlacement(projectObject);

  switch (field) {
  case 'widthMm': {
    const widthMm: number = getClampedObjectSizeMm(fieldValue);

    return {
      ...placement,
      widthMm,
      heightMm: isRatioLocked
        ? getScaledSizeMm(projectObject.heightMm, widthMm, projectObject.widthMm)
        : placement.heightMm,
    };
  }
  case 'heightMm': {
    const heightMm: number = getClampedObjectSizeMm(fieldValue);

    return {
      ...placement,
      heightMm,
      widthMm: isRatioLocked
        ? getScaledSizeMm(projectObject.widthMm, heightMm, projectObject.heightMm)
        : placement.widthMm,
    };
  }
  case 'rotationDeg':
    return { ...placement, rotationDeg: getNormalizedRotationDeg(fieldValue) };
  default:
    return { ...placement, [field]: fieldValue };
  }
};
