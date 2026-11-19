/**
 * Finds the first spot on the bed where a new object fits without overlapping the objects already there, keeping a
 * small gap around them. The search starts at the spot the object would normally take and moves away from it, row by
 * row, toward the far side of the bed. It answers undefined when no spot fits, so the caller keeps its usual placement.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getObjectCorners } from './get.object.corners';
import type { FreeBedSpotRequest } from './interfaces/FreeBedSpotRequest';
import type { ObjectCornerPoint } from './interfaces/ObjectCornerPoint';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { BED_EDGE_EPSILON_MM, FREE_SPOT_GAP_MM, FREE_SPOT_STEP_MM, HALF_BOX_FACTOR } from './project.constants';

/** An upright box on the bed, in millimetres. */
interface BedBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const getObjectBedBox = (projectObject: ProjectObjectTransform): BedBox => {
  const corners: ObjectCornerPoint[] = getObjectCorners(projectObject);
  const xValues: number[] = corners.map((corner: ObjectCornerPoint): number => corner.x);
  const yValues: number[] = corners.map((corner: ObjectCornerPoint): number => corner.y);

  return {
    minX: Math.min(...xValues),
    minY: Math.min(...yValues),
    maxX: Math.max(...xValues),
    maxY: Math.max(...yValues),
  };
};

const isBedBoxOverlapping = (box: BedBox, otherBox: BedBox): boolean =>
  box.minX < otherBox.maxX + FREE_SPOT_GAP_MM
  && otherBox.minX < box.maxX + FREE_SPOT_GAP_MM
  && box.minY < otherBox.maxY + FREE_SPOT_GAP_MM
  && otherBox.minY < box.maxY + FREE_SPOT_GAP_MM;

/** The positions along one axis, from the start toward the far side, that keep the object on the bed. */
const getAxisPositions = (startMm: number, objectSizeMm: number, bedSizeMm: number): number[] => {
  const lastMm: number = bedSizeMm - objectSizeMm;
  const isStartOnFarHalf: boolean = startMm + objectSizeMm * HALF_BOX_FACTOR > bedSizeMm * HALF_BOX_FACTOR;
  const stepMm: number = isStartOnFarHalf ? -FREE_SPOT_STEP_MM : FREE_SPOT_STEP_MM;
  const positions: number[] = [];

  for (
    let positionMm = Math.min(Math.max(startMm, 0), Math.max(lastMm, 0));
    positionMm >= -BED_EDGE_EPSILON_MM && positionMm <= lastMm + BED_EDGE_EPSILON_MM;
    positionMm += stepMm
  ) {
    positions.push(positionMm);
  }

  return positions;
};

export const getFreeBedSpot = (request: FreeBedSpotRequest): GeometryPoint | undefined => {
  const { widthMm, heightMm, startSpot, existingObjects, bedWidthMm, bedHeightMm } = request;
  const existingBoxes: BedBox[] = existingObjects.map(getObjectBedBox);
  const xPositions: number[] = getAxisPositions(startSpot.x, widthMm, bedWidthMm);
  const yPositions: number[] = getAxisPositions(startSpot.y, heightMm, bedHeightMm);

  for (const y of yPositions) {
    for (const x of xPositions) {
      const candidateBox: BedBox = { minX: x, minY: y, maxX: x + widthMm, maxY: y + heightMm };
      const isCandidateFree: boolean = existingBoxes.every(
        (box: BedBox): boolean => !isBedBoxOverlapping(candidateBox, box),
      );

      if (isCandidateFree) {
        return { x, y };
      }
    }
  }

  return undefined;
};
