import { getMotionTimeline } from './get.motion.timeline';
import { getTimelinePosition } from './get.timeline.position';
import type { MachineMotionLimits } from './interfaces/MachineMotionLimits';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

const LIMITS: MachineMotionLimits = {
  maxRateXMmPerMin: 24000,
  maxRateYMmPerMin: 24000,
  accelXMmPerS2: 1000,
  accelYMmPerS2: 1000,
  junctionDeviationMm: 0.01,
};
const BURN_POWER_PERCENT = 40;
const DIGITS = 6;
const START_POINT = { x: 0, y: 0 };
const ACCELERATION_PHASE_SECONDS = 0.05;
const ACCELERATION_PHASE_DISTANCE_MM = 1.25;

const getMove = (fromX: number, toX: number, powerPercent: number): ToolpathMove => ({
  kind: TOOLPATH_MOVE_KIND.BURN,
  from: { x: fromX, y: 0 },
  to: { x: toX, y: 0 },
  powerPercent,
  feedMmPerMin: 6000,
  layerKey: '#ff0000',
  airAssist: false,
});

describe(getTimelinePosition.name, () => {
  const toolpath = { startPoint: START_POINT, moves: [getMove(0, 100, BURN_POWER_PERCENT)] };
  const timeline = getMotionTimeline(toolpath, LIMITS);

  it('returns the midpoint at half time for a symmetric move', () => {
    const position = getTimelinePosition(toolpath, timeline, timeline.totalTimeS / 2);

    expect(position.point.x).toBeCloseTo(50, DIGITS);
    expect(position.moveIndex).toBe(0);
    expect(position.powerPercent).toBe(BURN_POWER_PERCENT);
  });

  it('follows the planned speed instead of interpolating by time', () => {
    const position = getTimelinePosition(toolpath, timeline, ACCELERATION_PHASE_SECONDS);

    expect(position.point.x).toBeCloseTo(ACCELERATION_PHASE_DISTANCE_MM, DIGITS);
  });

  it('clamps the time to the job', () => {
    expect(getTimelinePosition(toolpath, timeline, -1).point.x).toBe(0);
    expect(getTimelinePosition(toolpath, timeline, timeline.totalTimeS + 1).point.x).toBeCloseTo(100, DIGITS);
  });

  it('finds the move that is running with a binary search', () => {
    const twoMoves = { startPoint: START_POINT, moves: [getMove(0, 100, 10), getMove(100, 200, 20)] };
    const twoMoveTimeline = getMotionTimeline(twoMoves, LIMITS);
    const position = getTimelinePosition(twoMoves, twoMoveTimeline, (twoMoveTimeline.moveStartTimesS[1] ?? 0) + 0.01);

    expect(position.moveIndex).toBe(1);
    expect(position.powerPercent).toBe(20);
    expect(position.point.x).toBeGreaterThan(100);
  });

  it('gives the start point, move index -1 and power 0 for an empty toolpath', () => {
    const emptyTimeline = getMotionTimeline({ moves: [] }, LIMITS);
    const backRightStartPoint = { x: 400, y: 300 };

    expect(getTimelinePosition({ startPoint: backRightStartPoint, moves: [] }, emptyTimeline, 5)).toEqual({
      point: backRightStartPoint,
      moveIndex: -1,
      powerPercent: 0,
    });
  });
});
