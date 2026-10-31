/**
 * Clamps the laser head position to the bed so a head outside the bed stays visible at the edge.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from '../grbl/interfaces/GrblAxisPosition';
import type { BedHeadMarker } from './interfaces/BedHeadMarker';
import type { BedDimensions } from './interfaces/BedDimensions';

const getClampedCoordinate = (coordinateMm: number, lengthMm: number): number =>
  Math.min(Math.max(coordinateMm, 0), lengthMm);

export const getBedHeadMarker = (head: GrblAxisPosition, dimensions: BedDimensions): BedHeadMarker => {
  const xMm: number = getClampedCoordinate(head.x, dimensions.widthMm);
  const yMm: number = getClampedCoordinate(head.y, dimensions.heightMm);

  return { xMm, yMm, isOutsideBed: xMm !== head.x || yMm !== head.y };
};
