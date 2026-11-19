/**
 * Gets where the head cuts one burn path group at a timeline position: a binary search over the group's move indices
 * counts the moves already passed, and the move the head is on counts as burnt once the head reaches its end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { TimelinePosition } from './interfaces/TimelinePosition';
import type { ToolpathHeadCut } from './interfaces/ToolpathHeadCut';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import type { ToolpathStrokePath } from './interfaces/ToolpathStrokePath';
import { TOOLPATH_PATH_LENGTH_EPSILON_MM } from './toolpath.drawing.constants';

/** How many of the group's moves come before the given toolpath move. */
const getMoveCountBefore = (moveIndices: number[], moveIndex: number): number => {
  let low = 0;
  let high = moveIndices.length;

  while (low < high) {
    const middle: number = Math.floor((low + high) / 2);

    if ((moveIndices[middle] ?? Infinity) < moveIndex) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return low;
};

const getDistanceMm = (fromPoint: GeometryPoint, toPoint: GeometryPoint): number =>
  Math.hypot(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y);

/** Whether the head has left the start of the move. */
const hasHeadLeftMoveStart = (move: ToolpathMove, headPoint: GeometryPoint): boolean =>
  getDistanceMm(move.from, headPoint) > TOOLPATH_PATH_LENGTH_EPSILON_MM;

const hasHeadReachedMoveEnd = (move: ToolpathMove, headPoint: GeometryPoint): boolean =>
  getDistanceMm(headPoint, move.to) <= TOOLPATH_PATH_LENGTH_EPSILON_MM;

export const getToolpathHeadCut = (
  strokePath: ToolpathStrokePath,
  moves: ToolpathMove[],
  { point, moveIndex }: TimelinePosition,
): ToolpathHeadCut => {
  const doneMoveCount: number = getMoveCountBefore(strokePath.moveIndices, moveIndex);
  const currentMove: ToolpathMove | undefined = strokePath.moveIndices[doneMoveCount] === moveIndex
    ? moves[moveIndex]
    : undefined;

  if (!currentMove || !hasHeadLeftMoveStart(currentMove, point)) {
    return { burntMoveCount: doneMoveCount, splitMove: undefined, headPoint: point };
  }

  return hasHeadReachedMoveEnd(currentMove, point)
    ? { burntMoveCount: doneMoveCount + 1, splitMove: undefined, headPoint: point }
    : { burntMoveCount: doneMoveCount, splitMove: currentMove, headPoint: point };
};
