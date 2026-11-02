/**
 * Gets the highest speed in mm per second at which the head may pass the corner between two moves, from GRBL's
 * junction deviation: v = sqrt(a * deviation * s / (1 - s)) with s the sine of half the turn angle. A straight
 * continuation has no limit and a full reversal gives 0.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MoveDirection } from './interfaces/MoveDirection';
import { HALF, REST_SPEED_MM_PER_S, REVERSAL_SINE_EPSILON, STRAIGHT_SINE_EPSILON } from './motion.constants';

export const getJunctionSpeed = (
  incoming: MoveDirection,
  outgoing: MoveDirection,
  accelerationMmPerS2: number,
  junctionDeviationMm: number,
): number => {
  const cosineOfTurn: number = incoming.unitX * outgoing.unitX + incoming.unitY * outgoing.unitY;
  const sineOfHalfTurn: number = Math.sqrt(Math.max(0, (1 - cosineOfTurn) * HALF));

  if (sineOfHalfTurn < STRAIGHT_SINE_EPSILON) {
    return Infinity;
  }

  if (sineOfHalfTurn > 1 - REVERSAL_SINE_EPSILON) {
    return REST_SPEED_MM_PER_S;
  }

  return Math.sqrt((accelerationMmPerS2 * junctionDeviationMm * sineOfHalfTurn) / (1 - sineOfHalfTurn));
};
