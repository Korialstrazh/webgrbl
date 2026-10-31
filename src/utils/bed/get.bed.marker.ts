/**
 * Clamps a bed position (the laser head or the work zero) to the bed so a point outside the bed stays visible at
 * the edge.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from '../grbl/interfaces/GrblAxisPosition';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedMarker } from './interfaces/BedMarker';

const getClampedCoordinate = (coordinateMm: number, lengthMm: number): number =>
  Math.min(Math.max(coordinateMm, 0), lengthMm);

const isPositionOutsideBed = (position: GrblAxisPosition, markerXMm: number, markerYMm: number): boolean =>
  markerXMm !== position.x || markerYMm !== position.y;

export const getBedMarker = (position: GrblAxisPosition, dimensions: BedDimensions): BedMarker => {
  const xMm: number = getClampedCoordinate(position.x, dimensions.widthMm);
  const yMm: number = getClampedCoordinate(position.y, dimensions.heightMm);

  return { xMm, yMm, isOutsideBed: isPositionOutsideBed(position, xMm, yMm) };
};
