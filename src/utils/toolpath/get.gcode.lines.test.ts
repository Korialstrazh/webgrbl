import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import { GCODE_LINE_SEPARATOR } from './gcode.constants';
import { getGcodeLines } from './get.gcode.lines';
import { getGcodeText } from './get.gcode.text';
import type { GcodeContext } from './interfaces/GcodeContext';
import type { GcodeLine } from './interfaces/GcodeLine';
import type { Toolpath } from './interfaces/Toolpath';
import { newToolpath } from './test.support/new.toolpath';
import { newToolpathMove } from './test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

const OTHER_LAYER_KEY = '#0000ff';

const getContext = (overrides: Partial<GcodeContext> = {}): GcodeContext => ({
  projectName: 'Test',
  profileName: 'My laser',
  originCorner: MACHINE_ORIGIN_CORNER.FRONT_LEFT,
  workAreaXMm: 400,
  workAreaYMm: 300,
  sValueMax: 1000,
  hasAirAssist: true,
  appVersion: '0.1.0',
  createdAtIso: '2026-11-01T00:00:00.000Z',
  ...overrides,
});

const TOOLPATH: Toolpath = newToolpath({
  moves: [
    newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, to: { x: 10, y: 10 }, powerPercent: 0 }),
    newToolpathMove({ from: { x: 10, y: 10 }, to: { x: 20, y: 10 }, airAssist: true }),
    newToolpathMove({ from: { x: 20, y: 10 }, to: { x: 20, y: 20 }, layerKey: OTHER_LAYER_KEY }),
  ],
});

describe(getGcodeLines.name, () => {
  it('maps header, mode and air lines to no move and each move line to its index', () => {
    const lines: GcodeLine[] = getGcodeLines(TOOLPATH, getContext());

    expect(lines).toEqual([
      { text: '; webgrbl 0.1.0 - Test - 2026-11-01T00:00:00.000Z', moveIndex: undefined },
      { text: '; profile: My laser, S max 1000, origin front-left', moveIndex: undefined },
      { text: 'G21 G90', moveIndex: undefined },
      { text: 'M4 S0', moveIndex: undefined },
      { text: 'G0 X10 Y10', moveIndex: 0 },
      { text: 'M8', moveIndex: undefined },
      { text: 'G1 X20 Y10 S500 F6000', moveIndex: 1 },
      { text: 'M9', moveIndex: undefined },
      { text: 'G1 X20 Y20', moveIndex: 2 },
      { text: 'M5 S0', moveIndex: undefined },
      { text: '', moveIndex: undefined },
    ]);
  });

  it('joins to the same text as getGcodeText', () => {
    const context: GcodeContext = getContext();
    const lines: GcodeLine[] = getGcodeLines(TOOLPATH, context);

    expect(lines.map((line: GcodeLine): string => line.text).join(GCODE_LINE_SEPARATOR)).toBe(
      getGcodeText(TOOLPATH, context),
    );
  });
});
