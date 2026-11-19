/**
 * Gets the box around every point the head reaches. Moves are joined end to end, so the end points of all moves are
 * every point after the start, which leaves out the bed origin the job starts from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathBounds } from './interfaces/ToolpathBounds';
import type { ToolpathMove } from './interfaces/ToolpathMove';

export const getToolpathBounds = (moves: ToolpathMove[]): ToolpathBounds | undefined => {
  const firstMove: ToolpathMove | undefined = moves[0];

  if (!firstMove) {
    return undefined;
  }

  const { x: firstX, y: firstY } = firstMove.to;
  const bounds: ToolpathBounds = { minX: firstX, minY: firstY, maxX: firstX, maxY: firstY };

  for (const { to } of moves) {
    bounds.minX = Math.min(bounds.minX, to.x);
    bounds.minY = Math.min(bounds.minY, to.y);
    bounds.maxX = Math.max(bounds.maxX, to.x);
    bounds.maxY = Math.max(bounds.maxY, to.y);
  }

  return bounds;
};
