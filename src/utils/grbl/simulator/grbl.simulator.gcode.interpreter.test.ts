import { describe, expect, it } from 'vitest';
import { GRBL_SIMULATOR_DEFAULT_SETTINGS } from './grbl.simulator.default.settings';
import { getInterpretedGcodeLine } from './grbl.simulator.gcode.interpreter';
import type { GrblSimulatorGcodeError } from './interfaces/GrblSimulatorGcodeError';
import type { GrblSimulatorInterpretedLine } from './interfaces/GrblSimulatorInterpretedLine';
import type { GrblSimulatorModalState } from './interfaces/GrblSimulatorModalState';

const ORIGIN = { x: 0, y: 0, z: 0 };
const START_STATE: GrblSimulatorModalState = {
  isAbsolute: true,
  isMetric: true,
  feedRate: 0,
  spindleSpeed: 0,
  isLaserOn: false,
  motionMode: 0,
  position: ORIGIN,
  workCoordinateOffset: ORIGIN,
};
const FEED_600_LINE = 'G1X10F600';
const FEED_600_DURATION_MS = 1000;
const MILLIMETRES_PER_INCH = 25.4;
const ARC_RADIUS = 5;
const ARC_FEED = 600;
const MS_PER_MINUTE = 60_000;
const UNSUPPORTED_COMMAND_ERROR = 20;
const UNDEFINED_FEED_ERROR = 22;
const INVALID_LETTER_ERROR = 1;
const BAD_NUMBER_ERROR = 2;

const interpretLine = (line: string, state: GrblSimulatorModalState = START_STATE): GrblSimulatorInterpretedLine => {
  const result: GrblSimulatorInterpretedLine | GrblSimulatorGcodeError = getInterpretedGcodeLine(
    line,
    state,
    GRBL_SIMULATOR_DEFAULT_SETTINGS,
  );

  if ('errorCode' in result) {
    throw new Error(`Unexpected error ${result.errorCode}`);
  }

  return result;
};

describe(getInterpretedGcodeLine.name, () => {
  it('G1X10F600 from origin takes 1000 ms and ends at X10', () => {
    const result = interpretLine(FEED_600_LINE);

    expect(result.motionBlock).toEqual({
      target: { x: 10, y: 0, z: 0 },
      durationMs: FEED_600_DURATION_MS,
      spindleSpeed: 0,
    });
    expect(result.nextState.feedRate).toBe(ARC_FEED);
  });

  it('accepts lower case words', () => {
    expect(interpretLine('g1x10f600').motionBlock?.durationMs).toBe(FEED_600_DURATION_MS);
  });

  it('G91 makes moves relative', () => {
    const relativeState = interpretLine('G91').nextState;
    const moved = interpretLine('G1X10F600', { ...relativeState, position: { x: 5, y: 0, z: 0 } });

    expect(moved.motionBlock?.target).toEqual({ x: 15, y: 0, z: 0 });
  });

  it('G20 interprets coordinates as inches', () => {
    const inchState = interpretLine('G20').nextState;

    expect(interpretLine('G1X1F600', inchState).motionBlock?.target.x).toBeCloseTo(MILLIMETRES_PER_INCH);
  });

  it('G1 without feed rate answers error 22', () => {
    expect(getInterpretedGcodeLine('G1X10', START_STATE, GRBL_SIMULATOR_DEFAULT_SETTINGS)).toEqual({
      errorCode: UNDEFINED_FEED_ERROR,
    });
  });

  it('G38.2 answers error 20', () => {
    expect(getInterpretedGcodeLine('G38.2Z-5F50', START_STATE, GRBL_SIMULATOR_DEFAULT_SETTINGS)).toEqual({
      errorCode: UNSUPPORTED_COMMAND_ERROR,
    });
  });

  it('answers error 1 for an unknown letter and error 2 for a bad number', () => {
    expect(getInterpretedGcodeLine('Q5', START_STATE, GRBL_SIMULATOR_DEFAULT_SETTINGS)).toEqual({
      errorCode: INVALID_LETTER_ERROR,
    });
    expect(getInterpretedGcodeLine('G1X1.2.3', START_STATE, GRBL_SIMULATOR_DEFAULT_SETTINGS)).toEqual({
      errorCode: BAD_NUMBER_ERROR,
    });
  });

  it('G92X0 shifts the work offset without motion', () => {
    const result = interpretLine('G92X0', { ...START_STATE, position: { x: 7, y: 0, z: 0 } });

    expect(result.motionBlock).toBeUndefined();
    expect(result.nextState.workCoordinateOffset).toEqual({ x: 7, y: 0, z: 0 });
    expect(result.nextState.position.x).toBe(7);
  });

  it('G2 with I/J yields a block whose duration matches the arc length', () => {
    const result = interpretLine('G2X10Y0I5J0F600');
    const halfCircleLength = Math.PI * ARC_RADIUS;

    expect(result.motionBlock?.durationMs).toBeCloseTo((halfCircleLength / ARC_FEED) * MS_PER_MINUTE);
  });

  it('G3 full circle when start equals end', () => {
    const result = interpretLine('G3I5J0F600');

    expect(result.motionBlock?.durationMs).toBeCloseTo(((2 * Math.PI * ARC_RADIUS) / ARC_FEED) * MS_PER_MINUTE);
  });

  it('G4 P is a dwell in seconds at the current position', () => {
    const result = interpretLine('G4P2', { ...START_STATE, position: { x: 3, y: 0, z: 0 } });

    expect(result.motionBlock).toEqual({ target: { x: 3, y: 0, z: 0 }, durationMs: 2000, spindleSpeed: 0 });
  });

  it('G0 uses the slower of the X and Y max rates', () => {
    const result = getInterpretedGcodeLine('G0X100', START_STATE, { ...GRBL_SIMULATOR_DEFAULT_SETTINGS, 111: '3000' });

    expect(result).toMatchObject({ motionBlock: { durationMs: 2000 } });
  });

  it('M3 with S switches the laser on and M5 off, without motion', () => {
    const laserOn = interpretLine('M3S500');
    const laserOff = interpretLine('M5', laserOn.nextState);

    expect(laserOn.nextState).toMatchObject({ isLaserOn: true, spindleSpeed: 500 });
    expect(laserOn.motionBlock).toBeUndefined();
    expect(laserOff.nextState.isLaserOn).toBe(false);
  });

  it('moves with the modal motion mode when a line has axis words but no motion code', () => {
    const afterFirstMove = interpretLine(FEED_600_LINE);
    const secondMove = interpretLine('Y5', afterFirstMove.nextState);

    expect(secondMove.motionBlock?.target).toEqual({ x: 10, y: 5, z: 0 });
  });

  it('accepts a laser software header line and common footer words', () => {
    const header = interpretLine('G00G17G40G21G54');

    expect(header.motionBlock).toBeUndefined();
    expect(header.nextState.motionMode).toBe(0);
    expect(interpretLine('M8').motionBlock).toBeUndefined();
    expect(interpretLine('M2').nextState.isLaserOn).toBe(false);
    expect(interpretLine('M8', interpretLine('M3S500').nextState).nextState.isLaserOn).toBe(true);
  });

  it('reports laser power 0 while the laser is off', () => {
    const laserOff = interpretLine('M5');

    expect(interpretLine('G1X1F100S500', laserOff.nextState).motionBlock?.spindleSpeed).toBe(0);
  });

  it('reports laser power 0 for rapids and the modal S for feed moves', () => {
    const laserOn = interpretLine('M3S500').nextState;
    const rapid = interpretLine('G0X5', laserOn);

    expect(rapid.motionBlock?.spindleSpeed).toBe(0);
    expect(interpretLine('G1X10F600', rapid.nextState).motionBlock?.spindleSpeed).toBe(500);
  });

  it('motion lines without axis words only update modal state', () => {
    const spindleOnly = interpretLine('G1S0');
    const feedOnly = interpretLine('G1F600');

    expect(spindleOnly).toMatchObject({ motionBlock: undefined, nextState: { motionMode: 1, spindleSpeed: 0 } });
    expect(feedOnly.motionBlock).toBeUndefined();
    expect(feedOnly.nextState.feedRate).toBe(ARC_FEED);
    expect(interpretLine('G0').motionBlock).toBeUndefined();
  });

  it('G21 returns the next state without a motion block', () => {
    expect(interpretLine('G21')).toEqual({ nextState: START_STATE, motionBlock: undefined });
  });
});
