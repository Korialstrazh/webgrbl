/**
 * Gets the SVG view box around every object box of a project thumbnail, with a margin, in bed millimetres with y
 * turned to point down. An empty project gets a unit box.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObjectTransform } from '../../../utils/project/interfaces/ProjectObjectTransform';

const THUMBNAIL_MARGIN_FRACTION = 0.08;
const EMPTY_THUMBNAIL_VIEW_BOX = '0 0 1 1';

export const getThumbnailViewBox = (objectBoxes: ProjectObjectTransform[]): string => {
  if (!objectBoxes.length) {
    return EMPTY_THUMBNAIL_VIEW_BOX;
  }

  let minX: number = Number.POSITIVE_INFINITY;
  let minY: number = Number.POSITIVE_INFINITY;
  let maxX: number = Number.NEGATIVE_INFINITY;
  let maxY: number = Number.NEGATIVE_INFINITY;

  for (const { xMm, yMm, widthMm, heightMm } of objectBoxes) {
    minX = Math.min(minX, xMm);
    maxX = Math.max(maxX, xMm + widthMm);
    minY = Math.min(minY, -(yMm + heightMm));
    maxY = Math.max(maxY, -yMm);
  }

  const side: number = Math.max(maxX - minX, maxY - minY, 1);
  const margin: number = side * THUMBNAIL_MARGIN_FRACTION;
  const left: number = (minX + maxX - side) / 2 - margin;
  const top: number = (minY + maxY - side) / 2 - margin;

  return [left, top, side + margin + margin, side + margin + margin].join(' ');
};
