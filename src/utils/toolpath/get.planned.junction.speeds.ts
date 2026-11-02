/**
 * Plans the speed at the start of every move, and at the end of the last one, like GRBL's planner: a forward pass
 * limits what the acceleration can reach, then a backward pass limits what the deceleration can still stop.
 * The job starts and ends at rest and a zero-length move is left out of the plan.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MovePlanningData } from './interfaces/MovePlanningData';
import { REST_SPEED_MM_PER_S, SPEED_CHANGE_DISTANCE_FACTOR } from './motion.constants';

export const getPlannedJunctionSpeeds = (planningMoves: MovePlanningData[], junctionLimits: number[]): number[] => {
  const speeds: number[] = [REST_SPEED_MM_PER_S];
  let currentSpeed: number = REST_SPEED_MM_PER_S;

  for (const [index, { lengthMm, accelerationMmPerS2 }] of planningMoves.entries()) {
    const reachableSpeed: number = Math.sqrt(
      currentSpeed ** 2 + SPEED_CHANGE_DISTANCE_FACTOR * accelerationMmPerS2 * lengthMm,
    );
    const isLastMove: boolean = index === planningMoves.length - 1;

    const junctionLimit: number = junctionLimits[index] ?? REST_SPEED_MM_PER_S;

    currentSpeed = isLastMove ? REST_SPEED_MM_PER_S : Math.min(junctionLimit, reachableSpeed);
    speeds.push(currentSpeed);
  }

  let followingSpeed: number = REST_SPEED_MM_PER_S;

  for (let index = planningMoves.length - 1; index > 0; index--) {
    const { lengthMm, accelerationMmPerS2 } = planningMoves[index] ?? { lengthMm: 0, accelerationMmPerS2: 0 };
    const stoppableSpeed: number = Math.sqrt(
      followingSpeed ** 2 + SPEED_CHANGE_DISTANCE_FACTOR * accelerationMmPerS2 * lengthMm,
    );

    followingSpeed = Math.min(speeds[index] ?? REST_SPEED_MM_PER_S, stoppableSpeed);
    speeds[index] = followingSpeed;
  }

  return speeds;
};
