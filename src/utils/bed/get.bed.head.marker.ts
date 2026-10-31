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
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedHeadMarker } from './interfaces/BedHeadMarker';

const getClampedCoordinate = (coordinateMm: number, lengthMm: number): number =>
  Math.min(Math.max(coordinateMm, 0), lengthMm);

const isHeadOutsideBed = (head: GrblAxisPosition, markerXMm: number, markerYMm: number): boolean =>
  markerXMm !== head.x || markerYMm !== head.y;

export const getBedHeadMarker = (head: GrblAxisPosition, dimensions: BedDimensions): BedHeadMarker => {
  const xMm: number = getClampedCoordinate(head.x, dimensions.widthMm);
  const yMm: number = getClampedCoordinate(head.y, dimensions.heightMm);

  return { xMm, yMm, isOutsideBed: isHeadOutsideBed(head, xMm, yMm) };
};
