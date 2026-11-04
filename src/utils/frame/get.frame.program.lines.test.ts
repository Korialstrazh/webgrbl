import { describe, expect, it } from 'vitest';
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { getFrameProgramLines } from './get.frame.program.lines';

const PROFILE = newMachineProfile({
  workAreaXMm: 400,
  workAreaYMm: 300,
  originCorner: MACHINE_ORIGIN_CORNER.FRONT_LEFT,
});
const S_VALUE = 5;
const START_POINT = { x: 3, y: 4 };
const SQUARE_100 = { minX: 10, minY: 10, maxX: 110, maxY: 110 };
const SQUARE_50 = { minX: 0, minY: 0, maxX: 50, maxY: 50 };

describe(getFrameProgramLines.name, () => {
  it('traces the rectangle and returns to the start point', () => {
    const lines = getFrameProgramLines({
      rectangle: SQUARE_100,
      gridCellMm: 0,
      sValue: S_VALUE,
      profile: PROFILE,
      startPoint: START_POINT,
    });

    expect(lines).toEqual([
      'G21 G90',
      'M4 S5',
      'G0 X10 Y10',
      'G1 X110 Y10 F1500',
      'G1 X110 Y110',
      'G1 X10 Y110',
      'G1 X10 Y10',
      'M5 S0',
      'G0 X3 Y4',
      'G4 P0',
    ]);
  });

  it('adds serpentine grid lines after the rectangle, joined by travel moves', () => {
    const lines = getFrameProgramLines({
      rectangle: SQUARE_50,
      gridCellMm: 20,
      sValue: S_VALUE,
      profile: PROFILE,
      startPoint: START_POINT,
    });

    expect(lines.slice(7, -3)).toEqual([
      'G0 X20 Y0',
      'G1 X20 Y50',
      'G0 X40 Y50',
      'G1 X40 Y0',
      'G0 X50 Y20',
      'G1 X0 Y20',
      'G0 X0 Y40',
      'G1 X50 Y40',
    ]);
  });

  it('gives the rectangle only when the cell is larger than the outline', () => {
    const withoutGrid = getFrameProgramLines({
      rectangle: SQUARE_50,
      gridCellMm: 0,
      sValue: S_VALUE,
      profile: PROFILE,
      startPoint: START_POINT,
    });
    const withLargeCell = getFrameProgramLines({
      rectangle: SQUARE_50,
      gridCellMm: 200,
      sValue: S_VALUE,
      profile: PROFILE,
      startPoint: START_POINT,
    });

    expect(withLargeCell).toEqual(withoutGrid);
  });

  it('maps the points for a back-right origin but not the start point', () => {
    const lines = getFrameProgramLines({
      rectangle: SQUARE_100,
      gridCellMm: 0,
      sValue: S_VALUE,
      profile: { ...PROFILE, originCorner: MACHINE_ORIGIN_CORNER.BACK_RIGHT },
      startPoint: START_POINT,
    });

    expect(lines[2]).toBe('G0 X390 Y290');
    expect(lines[3]).toBe('G1 X290 Y290 F1500');
    expect(lines.at(-2)).toBe('G0 X3 Y4');
    expect(lines.at(-1)).toBe('G4 P0');
  });
});
