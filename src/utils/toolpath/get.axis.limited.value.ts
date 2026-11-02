/**
 * Gets the largest value along a direction whose X and Y components both stay within their axis limits. Used for
 * the rate (mm per second) and the acceleration (mm per second squared). A zero component does not limit.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MoveDirection } from './interfaces/MoveDirection';
import { DIRECTION_COMPONENT_EPSILON } from './motion.constants';

export const getAxisLimitedValue = (
  { unitX, unitY }: MoveDirection,
  limitX: number,
  limitY: number,
): number => {
  const absoluteX: number = Math.abs(unitX);
  const absoluteY: number = Math.abs(unitY);
  const valueFromX: number = absoluteX > DIRECTION_COMPONENT_EPSILON ? limitX / absoluteX : Infinity;
  const valueFromY: number = absoluteY > DIRECTION_COMPONENT_EPSILON ? limitY / absoluteY : Infinity;

  return Math.min(valueFromX, valueFromY);
};
