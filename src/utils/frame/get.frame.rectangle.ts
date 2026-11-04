/**
 * Gets the outline of all burn moves, power 0 overscan included, grown by a margin on every side.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import type { FrameRectangle } from './interfaces/FrameRectangle';

export const getFrameRectangle = (
  moves: ToolpathMove[],
  marginMm: number,
): FrameRectangle | undefined => {
  let rectangle: FrameRectangle | undefined;

  for (const move of moves) {
    if (move.kind !== TOOLPATH_MOVE_KIND.BURN) {
      continue;
    }

    for (const point of [move.from, move.to]) {
      rectangle = {
        minX: Math.min(rectangle?.minX ?? point.x, point.x),
        minY: Math.min(rectangle?.minY ?? point.y, point.y),
        maxX: Math.max(rectangle?.maxX ?? point.x, point.x),
        maxY: Math.max(rectangle?.maxY ?? point.y, point.y),
      };
    }
  }

  if (!rectangle) {
    return undefined;
  }

  return {
    minX: rectangle.minX - marginMm,
    minY: rectangle.minY - marginMm,
    maxX: rectangle.maxX + marginMm,
    maxY: rectangle.maxY + marginMm,
  };
};
