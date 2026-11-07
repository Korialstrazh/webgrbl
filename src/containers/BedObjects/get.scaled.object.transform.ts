/**
 * Gets an object scaled by dragging one corner handle. The opposite corner stays fixed on the bed, also for a turned
 * object: the pointer's move is turned into the object's own frame, the box grows or shrinks there, and its new centre
 * is turned back. The aspect ratio is kept by the side that changed most, unless Shift frees it. Width and height stay
 * within 0.1 to 5000 mm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getClampedObjectSizeMm } from '../../utils/project/get.clamped.object.size.mm';
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import {
  HALF_BOX_FACTOR,
  HALF_TURN_DEG,
  MAX_OBJECT_SIZE_MM,
  MIN_OBJECT_SIZE_MM,
} from '../../utils/project/project.constants';
import type { ObjectArtworkFrame } from '../../utils/toolpath/interfaces/ObjectArtworkFrame';
import { FULL_OBJECT_ARTWORK_FRAME } from '../../utils/toolpath/object.artwork.frame.constants';
import { SCALE_HANDLE_CORNER_SIGNS } from './bed.objects.constants';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';
import type { ObjectScaleInput } from './interfaces/ObjectScaleInput';

type ObjectBoxSize = Pick<ProjectObjectTransform, 'widthMm' | 'heightMm'>;

const getTurnedVector = (vector: BedMachinePoint, angleRadians: number): BedMachinePoint => ({
  x: vector.x * Math.cos(angleRadians) - vector.y * Math.sin(angleRadians),
  y: vector.x * Math.sin(angleRadians) + vector.y * Math.cos(angleRadians),
});

/** The factor of the side that changed most, kept within the range both sides allow when such a factor exists. */
const getKeptRatioSize = (startSize: ObjectBoxSize, freeSize: ObjectBoxSize): ObjectBoxSize => {
  const { widthMm, heightMm }: ObjectBoxSize = startSize;
  const widthFactor: number = freeSize.widthMm / widthMm;
  const heightFactor: number = freeSize.heightMm / heightMm;
  const hasWidthChangedMost: boolean = Math.abs(widthFactor - 1) >= Math.abs(heightFactor - 1);
  const changedMostFactor: number = hasWidthChangedMost ? widthFactor : heightFactor;
  const smallestFactor: number = Math.max(MIN_OBJECT_SIZE_MM / widthMm, MIN_OBJECT_SIZE_MM / heightMm);
  const largestFactor: number = Math.min(MAX_OBJECT_SIZE_MM / widthMm, MAX_OBJECT_SIZE_MM / heightMm);
  const factor: number = Math.min(Math.max(changedMostFactor, smallestFactor), largestFactor);

  return { widthMm: getClampedObjectSizeMm(widthMm * factor), heightMm: getClampedObjectSizeMm(heightMm * factor) };
};

/**
 * Where the corner that stays put sits on one axis, as a fraction of the box size from the box centre: the handles sit
 * on the drawn geometry, so the geometry's opposite corner is the one kept in place.
 */
const getKeptCornerFraction = (cornerSign: number, startFraction: number, extentFraction: number): number =>
  startFraction - HALF_BOX_FACTOR + (cornerSign < 0 ? extentFraction : 0);

export const getScaledObjectTransform = (input: ObjectScaleInput): ProjectObjectTransform => {
  const { startTransform, handle, pointerOffset, isAspectRatioFree } = input;
  const artworkFrame: ObjectArtworkFrame = input.artworkFrame ?? FULL_OBJECT_ARTWORK_FRAME;
  const bottomFraction: number = 1 - artworkFrame.topFraction - artworkFrame.heightFraction;
  const cornerSign: BedMachinePoint = SCALE_HANDLE_CORNER_SIGNS[handle];
  const angleRadians: number = startTransform.rotationDeg * Math.PI / HALF_TURN_DEG;
  const objectFrameOffset: BedMachinePoint = getTurnedVector(pointerOffset, -angleRadians);
  const freeSize: ObjectBoxSize = {
    // The handle moves with the geometry, which is a fraction of the box, so the box changes by more.
    widthMm: getClampedObjectSizeMm(
      startTransform.widthMm + cornerSign.x * objectFrameOffset.x / artworkFrame.widthFraction,
    ),
    heightMm: getClampedObjectSizeMm(
      startTransform.heightMm + cornerSign.y * objectFrameOffset.y / artworkFrame.heightFraction,
    ),
  };
  const scaledSize: ObjectBoxSize = isAspectRatioFree ? freeSize : getKeptRatioSize(startTransform, freeSize);
  const { widthMm, heightMm }: ObjectBoxSize = scaledSize;

  // The centre moves so the geometry's opposite corner stays where it is.
  const centerShift: BedMachinePoint = getTurnedVector({
    x: getKeptCornerFraction(cornerSign.x, artworkFrame.leftFraction, artworkFrame.widthFraction)
      * (startTransform.widthMm - widthMm),
    y: getKeptCornerFraction(cornerSign.y, bottomFraction, artworkFrame.heightFraction)
      * (startTransform.heightMm - heightMm),
  }, angleRadians);

  return {
    xMm: startTransform.xMm + (startTransform.widthMm - widthMm) * HALF_BOX_FACTOR + centerShift.x,
    yMm: startTransform.yMm + (startTransform.heightMm - heightMm) * HALF_BOX_FACTOR + centerShift.y,
    widthMm,
    heightMm,
    rotationDeg: startTransform.rotationDeg,
  };
};
