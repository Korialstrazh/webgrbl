/**
 * Gets the unit direction and the length of a move.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MoveDirection } from './interfaces/MoveDirection';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { MOTION_LENGTH_EPSILON_MM } from './motion.constants';

export const getMoveDirection = ({ from, to }: ToolpathMove): MoveDirection => {
  const deltaX: number = to.x - from.x;
  const deltaY: number = to.y - from.y;
  const lengthMm: number = Math.hypot(deltaX, deltaY);

  if (lengthMm <= MOTION_LENGTH_EPSILON_MM) {
    return { unitX: 0, unitY: 0, lengthMm: 0 };
  }

  return { unitX: deltaX / lengthMm, unitY: deltaY / lengthMm, lengthMm };
};
