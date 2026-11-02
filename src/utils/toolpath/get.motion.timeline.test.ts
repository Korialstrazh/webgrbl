import { getMotionTimeline } from './get.motion.timeline';
import type { MachineMotionLimits } from './interfaces/MachineMotionLimits';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

const FEED_MM_PER_MIN = 6000;
const ACCELERATION_MM_PER_S2 = 1000;
const LIMITS: MachineMotionLimits = {
  maxRateXMmPerMin: 24000,
  maxRateYMmPerMin: 24000,
  accelXMmPerS2: ACCELERATION_MM_PER_S2,
  accelYMmPerS2: ACCELERATION_MM_PER_S2,
  junctionDeviationMm: 0.01,
};
const SPEED_ROUNDING_DIGITS = 3;
const TIME_ROUNDING_DIGITS = 6;
const SINGLE_MOVE_SECONDS = 1.1;
const LONG_MOVE_SECONDS = 2.1;
const SQUARE_CORNER_SPEED_MM_PER_S = 4.9;
const SLOW_MAX_RATE_MM_PER_MIN = 3000;

const getMove = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  kind: ToolpathMove['kind'] = TOOLPATH_MOVE_KIND.BURN,
): ToolpathMove => ({
  kind,
  from: { x: fromX, y: fromY },
  to: { x: toX, y: toY },
  powerPercent: 50,
  feedMmPerMin: FEED_MM_PER_MIN,
  layerKey: '#ff0000',
  airAssist: false,
});

describe(getMotionTimeline.name, () => {
  it('takes 1.1 s for a single 100 mm move at 6000 mm/min and 1000 mm/s2', () => {
    const timeline = getMotionTimeline({ moves: [getMove(0, 0, 100, 0)] }, LIMITS);

    expect(timeline.totalTimeS).toBeCloseTo(SINGLE_MOVE_SECONDS, TIME_ROUNDING_DIGITS);
    expect(timeline.moveStartTimesS).toEqual([0]);
  });

  it('keeps the speed through a straight continuation', () => {
    const timeline = getMotionTimeline({ moves: [getMove(0, 0, 100, 0), getMove(100, 0, 200, 0)] }, LIMITS);

    expect(timeline.moveProfiles[0]?.exitSpeedMmPerS).toBeCloseTo(FEED_MM_PER_MIN / 60, SPEED_ROUNDING_DIGITS);
    expect(timeline.totalTimeS).toBeCloseTo(LONG_MOVE_SECONDS, TIME_ROUNDING_DIGITS);
  });

  it('slows down at a 90 degree corner', () => {
    const timeline = getMotionTimeline({ moves: [getMove(0, 0, 100, 0), getMove(100, 0, 100, 100)] }, LIMITS);

    expect(timeline.moveProfiles[0]?.exitSpeedMmPerS).toBeCloseTo(SQUARE_CORNER_SPEED_MM_PER_S, 1);
    expect(timeline.totalTimeS).toBeGreaterThan(LONG_MOVE_SECONDS);
  });

  it('stops at a full reversal', () => {
    const timeline = getMotionTimeline({ moves: [getMove(0, 0, 100, 0), getMove(100, 0, 0, 0)] }, LIMITS);

    expect(timeline.moveProfiles[0]?.exitSpeedMmPerS).toBe(0);
  });

  it('runs a travel at the axis-limited rate and a burn no faster than it', () => {
    const slowLimits: MachineMotionLimits = { ...LIMITS, maxRateXMmPerMin: SLOW_MAX_RATE_MM_PER_MIN };
    const travel = getMotionTimeline({ moves: [getMove(0, 0, 100, 0, TOOLPATH_MOVE_KIND.TRAVEL)] }, slowLimits);
    const burn = getMotionTimeline({ moves: [getMove(0, 0, 100, 0)] }, slowLimits);

    expect(travel.moveProfiles[0]?.peakSpeedMmPerS).toBeCloseTo(SLOW_MAX_RATE_MM_PER_MIN / 60, SPEED_ROUNDING_DIGITS);
    expect(burn.moveProfiles[0]?.peakSpeedMmPerS).toBeCloseTo(SLOW_MAX_RATE_MM_PER_MIN / 60, SPEED_ROUNDING_DIGITS);
  });

  it('gives a triangle profile to a move too short to reach the feed', () => {
    const timeline = getMotionTimeline({ moves: [getMove(0, 0, 1, 0)] }, LIMITS);

    expect(timeline.moveProfiles[0]?.peakSpeedMmPerS).toBeCloseTo(
      Math.sqrt(ACCELERATION_MM_PER_S2),
      SPEED_ROUNDING_DIGITS,
    );
  });

  it('takes no time for a zero-length move and plans around it', () => {
    const timeline = getMotionTimeline(
      { moves: [getMove(0, 0, 100, 0), getMove(100, 0, 100, 0), getMove(100, 0, 200, 0)] },
      LIMITS,
    );

    expect(timeline.moveProfiles[1]?.durationS).toBe(0);
    expect(timeline.totalTimeS).toBeCloseTo(LONG_MOVE_SECONDS, TIME_ROUNDING_DIGITS);
  });

  it('is empty without moves', () => {
    expect(getMotionTimeline({ moves: [] }, LIMITS)).toEqual({ moveStartTimesS: [], moveProfiles: [], totalTimeS: 0 });
  });
});
