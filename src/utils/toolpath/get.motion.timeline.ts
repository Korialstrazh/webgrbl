/**
 * Plans the timing of a toolpath: every move speeds up, cruises and slows down under the axis limits, and the
 * corner between two moves is taken at the speed GRBL's junction deviation allows. Returns when each move starts and
 * the total time.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getAxisLimitedValue } from './get.axis.limited.value';
import { getJunctionSpeed } from './get.junction.speed';
import { getMoveDirection } from './get.move.direction';
import { getMoveMotionProfile } from './get.move.motion.profile';
import { getMoveNominalSpeed } from './get.move.nominal.speed';
import { getPlannedJunctionSpeeds } from './get.planned.junction.speeds';
import type { MachineMotionLimits } from './interfaces/MachineMotionLimits';
import type { MotionTimeline } from './interfaces/MotionTimeline';
import type { MoveDirection } from './interfaces/MoveDirection';
import type { MoveMotionProfile } from './interfaces/MoveMotionProfile';
import type { MovePlanningData } from './interfaces/MovePlanningData';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { REST_SPEED_MM_PER_S } from './motion.constants';

const getStillMoveProfile = (): MoveMotionProfile => ({
  lengthMm: 0,
  entrySpeedMmPerS: 0,
  peakSpeedMmPerS: 0,
  exitSpeedMmPerS: 0,
  accelerationMmPerS2: 0,
  durationS: 0,
});

const getPlanningMoves = (moves: ToolpathMove[], limits: MachineMotionLimits): MovePlanningData[] => {
  const planningMoves: MovePlanningData[] = [];

  for (const [moveIndex, move] of moves.entries()) {
    const direction: MoveDirection = getMoveDirection(move);

    if (direction.lengthMm) {
      planningMoves.push({
        moveIndex,
        direction,
        lengthMm: direction.lengthMm,
        nominalSpeedMmPerS: getMoveNominalSpeed(move, direction, limits),
        accelerationMmPerS2: getAxisLimitedValue(direction, limits.accelXMmPerS2, limits.accelYMmPerS2),
      });
    }
  }

  return planningMoves;
};

const getJunctionLimits = (planningMoves: MovePlanningData[], limits: MachineMotionLimits): number[] =>
  planningMoves.map((move, planIndex): number => {
    const next: MovePlanningData | undefined = planningMoves[planIndex + 1];

    if (!next) {
      return REST_SPEED_MM_PER_S;
    }

    const junctionSpeed: number = getJunctionSpeed(
      move.direction,
      next.direction,
      Math.min(move.accelerationMmPerS2, next.accelerationMmPerS2),
      limits.junctionDeviationMm,
    );

    return Math.min(junctionSpeed, move.nominalSpeedMmPerS, next.nominalSpeedMmPerS);
  });

export const getMotionTimeline = (toolpath: Pick<Toolpath, 'moves'>, limits: MachineMotionLimits): MotionTimeline => {
  const planningMoves: MovePlanningData[] = getPlanningMoves(toolpath.moves, limits);
  const junctionSpeeds: number[] = getPlannedJunctionSpeeds(planningMoves, getJunctionLimits(planningMoves, limits));
  const moveProfiles: MoveMotionProfile[] = toolpath.moves.map(getStillMoveProfile);

  for (const [planIndex, { moveIndex, lengthMm, nominalSpeedMmPerS, accelerationMmPerS2 }] of planningMoves.entries()) {
    moveProfiles[moveIndex] = getMoveMotionProfile({
      lengthMm,
      nominalSpeedMmPerS,
      accelerationMmPerS2,
      entrySpeedMmPerS: junctionSpeeds[planIndex] ?? REST_SPEED_MM_PER_S,
      exitSpeedMmPerS: junctionSpeeds[planIndex + 1] ?? REST_SPEED_MM_PER_S,
    });
  }

  const moveStartTimesS: number[] = [];
  let totalTimeS = 0;

  for (const profile of moveProfiles) {
    moveStartTimesS.push(totalTimeS);
    totalTimeS += profile.durationS;
  }

  return { moveStartTimesS, moveProfiles, totalTimeS };
};
