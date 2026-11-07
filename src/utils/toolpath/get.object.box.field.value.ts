/**
 * Turns a value typed into an object field, which speaks of the drawn geometry, back into the value of the object's
 * box (its SVG page), so the stored placement and everything built from it keep working on the box.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../project/interfaces/ProjectObjectTransform';
import type { ObjectBoxFieldInput } from './interfaces/ObjectBoxFieldInput';

export const getObjectBoxFieldValue = (input: ObjectBoxFieldInput): number => {
  const { boxPlacement, artworkFrame, field, artworkValue } = input;
  const bottomFraction: number = 1 - artworkFrame.topFraction - artworkFrame.heightFraction;
  const boxValues: ProjectObjectTransform = {
    xMm: artworkValue - artworkFrame.leftFraction * boxPlacement.widthMm,
    yMm: artworkValue - bottomFraction * boxPlacement.heightMm,
    widthMm: artworkValue / artworkFrame.widthFraction,
    heightMm: artworkValue / artworkFrame.heightFraction,
    rotationDeg: artworkValue,
  };

  return boxValues[field];
};
