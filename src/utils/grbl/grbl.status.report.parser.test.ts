import { describe, expect, it } from 'vitest';
import { GRBL_MACHINE_STATE } from './grbl.constants';
import { getParsedGrblStatusReport } from './grbl.status.report.parser';

const HOLD_LINE = '<Hold:0|MPos:1.000,2.000,0.000|Bf:15,128|FS:0,0|WCO:0.500,0.500,0.000>';
const WORK_LINE = '<Idle|WPos:4.000,5.000,6.000|F:500>';
const OVERRIDE_LINE = '<Run|MPos:0,0,0|FS:1000,255|Ov:100,50,75|Pn:XYZ>';
const FEED_RATE = 500;

describe(getParsedGrblStatusReport.name, () => {
  it('parses state, substate, machine position, buffers and offset', () => {
    expect(getParsedGrblStatusReport(HOLD_LINE)).toMatchObject({
      machineState: GRBL_MACHINE_STATE.HOLD,
      machineSubstate: 0,
      machinePosition: { x: 1, y: 2, z: 0 },
      plannerBlocksAvailable: 15,
      rxBytesAvailable: 128,
      workCoordinateOffset: { x: 0.5, y: 0.5, z: 0 },
    });
  });

  it('parses work position and the F field', () => {
    const report = getParsedGrblStatusReport(WORK_LINE);

    expect(report?.machineState).toBe(GRBL_MACHINE_STATE.IDLE);
    expect(report?.machineSubstate).toBeUndefined();
    expect(report?.workPosition).toEqual({ x: 4, y: 5, z: 6 });
    expect(report?.feedRate).toBe(FEED_RATE);
  });

  it('parses FS and overrides and ignores unknown fields', () => {
    expect(getParsedGrblStatusReport(OVERRIDE_LINE)).toMatchObject({
      feedRate: 1000,
      spindleSpeed: 255,
      overrides: { feedPercent: 100, rapidPercent: 50, spindlePercent: 75 },
    });
  });

  it('returns undefined for an unknown state', () => {
    expect(getParsedGrblStatusReport('<Weird|MPos:0,0,0>')).toBeUndefined();
  });

  it('returns undefined for a line that is not a report', () => {
    expect(getParsedGrblStatusReport('ok')).toBeUndefined();
  });
});
