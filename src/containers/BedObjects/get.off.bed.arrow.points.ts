/**
 * The triangles on the bed edges that point to where an object's artwork runs off the bed: one per edge it crosses,
 * its tip on that edge level with the artwork centre (held on the bed), in bed SVG units with y growing to the front.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import type { ObjectArtworkBedBounds } from '../../utils/project/interfaces/ObjectArtworkBedBounds';
import { HALF_BOX_FACTOR } from '../../utils/project/project.constants';

/** How wide the base of an arrow is against its length. */
const ARROW_BASE_FACTOR = 0.6;

const getClampedValue = (value: number, maxValue: number): number => Math.min(Math.max(value, 0), maxValue);

const getPointsText = (points: number[][]): string => points.map((point: number[]) => point.join(',')).join(' ');

export const getOffBedArrowPoints = (
  bounds: ObjectArtworkBedBounds,
  bed: BedDimensions,
  arrowSize: number,
): string[] => {
  const halfBase: number = arrowSize * ARROW_BASE_FACTOR;
  const tipX: number = getClampedValue((bounds.minXMm + bounds.maxXMm) * HALF_BOX_FACTOR, bed.widthMm);
  const tipY: number = bed.heightMm - getClampedValue((bounds.minYMm + bounds.maxYMm) * HALF_BOX_FACTOR, bed.heightMm);
  const arrowPoints: string[] = [];

  if (bounds.minXMm < 0) {
    arrowPoints.push(getPointsText([[0, tipY], [arrowSize, tipY - halfBase], [arrowSize, tipY + halfBase]]));
  }

  if (bounds.maxXMm > bed.widthMm) {
    const baseX: number = bed.widthMm - arrowSize;

    arrowPoints.push(getPointsText([[bed.widthMm, tipY], [baseX, tipY - halfBase], [baseX, tipY + halfBase]]));
  }

  if (bounds.maxYMm > bed.heightMm) {
    arrowPoints.push(getPointsText([[tipX, 0], [tipX - halfBase, arrowSize], [tipX + halfBase, arrowSize]]));
  }

  if (bounds.minYMm < 0) {
    const baseY: number = bed.heightMm - arrowSize;

    arrowPoints.push(getPointsText([[tipX, bed.heightMm], [tipX - halfBase, baseY], [tipX + halfBase, baseY]]));
  }

  return arrowPoints;
};
