/**
 * Gets where the head is at a second of the job: a binary search finds the move, then the position inside it is
 * solved under the move's speed profile, so the head moves at the planned speed. The time is clamped to the job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getProfileDistance } from './get.profile.distance';
import type { MotionTimeline } from './interfaces/MotionTimeline';
import type { MoveMotionProfile } from './interfaces/MoveMotionProfile';
import type { TimelinePosition } from './interfaces/TimelinePosition';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { TRAVEL_POWER_PERCENT } from './toolpath.constants';

const NO_MOVE_INDEX = -1;

const getLastStartedMoveIndex = (moveStartTimesS: number[], timeS: number): number => {
  let low = 0;
  let high = moveStartTimesS.length - 1;

  while (low < high) {
    const middle: number = Math.ceil((low + high) / 2);

    if ((moveStartTimesS[middle] ?? Infinity) <= timeS) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return low;
};

type TimelineToolpath = Pick<Toolpath, 'moves' | 'startPoint'>;

const getStartPosition = (startPoint: GeometryPoint): TimelinePosition => ({
  point: { ...startPoint },
  moveIndex: NO_MOVE_INDEX,
  powerPercent: TRAVEL_POWER_PERCENT,
});

export const getTimelinePosition = (
  toolpath: TimelineToolpath,
  timeline: MotionTimeline,
  timeS: number,
): TimelinePosition => {
  const clampedTimeS: number = Math.min(Math.max(timeS, 0), timeline.totalTimeS);
  const moveIndex: number = getLastStartedMoveIndex(timeline.moveStartTimesS, clampedTimeS);
  const move: ToolpathMove | undefined = toolpath.moves[moveIndex];
  const profile: MoveMotionProfile | undefined = timeline.moveProfiles[moveIndex];

  if (!move || !profile) {
    return getStartPosition(toolpath.startPoint);
  }

  const coveredMm: number = getProfileDistance(profile, clampedTimeS - (timeline.moveStartTimesS[moveIndex] ?? 0));
  const progress: number = profile.lengthMm ? coveredMm / profile.lengthMm : 1;

  return {
    point: {
      x: move.from.x + (move.to.x - move.from.x) * progress,
      y: move.from.y + (move.to.y - move.from.y) * progress,
    },
    moveIndex,
    powerPercent: move.powerPercent,
  };
};
