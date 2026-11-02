import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import {
  GCODE_AIR_ASSIST_OFF,
  GCODE_AIR_ASSIST_ON,
  GCODE_BURN_WORD,
  GCODE_LASER_OFF_END,
  GCODE_LINE_SEPARATOR,
} from './gcode.constants';
import { getGcodeText } from './get.gcode.text';
import type { GcodeContext } from './interfaces/GcodeContext';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { newToolpath } from './test.support/new.toolpath';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

const LAYER_KEY = '#ff0000';
const OTHER_LAYER_KEY = '#0000ff';
const S_VALUE_MAX = 1000;
const NON_TRIVIAL_S_VALUE_MAX = 255;
const FEED = 300;
const OTHER_FEED = 600;
const LINE_BREAK_PATTERN = /\r*\n\r*/;

const getContext = (overrides: Partial<GcodeContext> = {}): GcodeContext => ({
  projectName: 'Test',
  profileName: 'My laser',
  originCorner: MACHINE_ORIGIN_CORNER.FRONT_LEFT,
  workAreaXMm: 400,
  workAreaYMm: 300,
  sValueMax: S_VALUE_MAX,
  hasAirAssist: false,
  appVersion: '0.1.0',
  createdAtIso: '2026-11-01T00:00:00.000Z',
  ...overrides,
});

const getMove = (overrides: Partial<ToolpathMove> = {}): ToolpathMove => ({
  kind: TOOLPATH_MOVE_KIND.BURN,
  from: { x: 0, y: 0 },
  to: { x: 0, y: 0 },
  powerPercent: 100,
  feedMmPerMin: FEED,
  layerKey: LAYER_KEY,
  airAssist: false,
  ...overrides,
});

const getToolpath = (moves: ToolpathMove[]): Toolpath => newToolpath({ moves });

const getSValues = (text: string): number[] =>
  Array.from(text.matchAll(/S(\d+)/g), (match: RegExpMatchArray): number => Number(match[1]));

describe(getGcodeText.name, () => {
  it('writes the header, one travel, one burn and the footer', () => {
    const toolpath: Toolpath = getToolpath([
      getMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, to: { x: 10, y: 10 }, powerPercent: 0 }),
      getMove({ from: { x: 10, y: 10 }, to: { x: 20, y: 10 } }),
    ]);

    expect(getGcodeText(toolpath, getContext())).toBe(
      [
        '; webgrbl 0.1.0 - Test - 2026-11-01T00:00:00.000Z',
        '; profile: My laser, S max 1000, origin front-left',
        'G21 G90',
        'M4 S0',
        'G0 X10 Y10',
        'G1 X20 Y10 S1000 F300',
        'M5 S0',
        '',
      ].join(GCODE_LINE_SEPARATOR),
    );
  });

  it('repeats S and F only when they change', () => {
    const toolpath: Toolpath = getToolpath([
      getMove({ to: { x: 5, y: 0 } }),
      getMove({ from: { x: 5, y: 0 }, to: { x: 5, y: 5 } }),
      getMove({ from: { x: 5, y: 5 }, to: { x: 0, y: 5 }, powerPercent: 0 }),
      getMove({ from: { x: 0, y: 5 }, to: { x: 0, y: 0 }, powerPercent: 50, feedMmPerMin: OTHER_FEED }),
    ]);

    const lines: string[] = getGcodeText(toolpath, getContext()).split(LINE_BREAK_PATTERN);

    expect(lines).toContain('G1 X5 Y0 S1000 F300');
    expect(lines).toContain('G1 X5 Y5');
    expect(lines).toContain('G1 X0 Y5 S0');
    expect(lines).toContain('G1 X0 Y0 S500 F600');
  });

  it('never writes an S above the S max and rounds the share of it', () => {
    const toolpath: Toolpath = getToolpath([
      getMove({ to: { x: 1, y: 0 }, powerPercent: 100 }),
      getMove({ to: { x: 2, y: 0 }, powerPercent: 250 }),
      getMove({ to: { x: 3, y: 0 }, powerPercent: 50 }),
      getMove({ to: { x: 4, y: 0 }, powerPercent: Number.NaN }),
      getMove({ to: { x: 5, y: 0 }, powerPercent: -5 }),
    ]);

    const text: string = getGcodeText(toolpath, getContext({ sValueMax: NON_TRIVIAL_S_VALUE_MAX }));

    expect(text).toContain('S255');
    expect(text).toContain('S128');
    expect(getSValues(text).every((value: number): boolean => value <= NON_TRIVIAL_S_VALUE_MAX)).toBe(true);
  });

  it('writes no burn line for a toolpath without moves', () => {
    const text: string = getGcodeText(getToolpath([]), getContext());

    expect(text).not.toContain(GCODE_BURN_WORD);
    expect(text.endsWith(`${GCODE_LASER_OFF_END}${GCODE_LINE_SEPARATOR}`)).toBe(true);
  });

  it('switches air assist around a layer when the machine has it', () => {
    const toolpath: Toolpath = getToolpath([
      getMove({ to: { x: 1, y: 0 }, airAssist: true }),
      getMove({ from: { x: 1, y: 0 }, to: { x: 2, y: 0 }, airAssist: true }),
      getMove({ from: { x: 2, y: 0 }, to: { x: 3, y: 0 }, layerKey: OTHER_LAYER_KEY }),
    ]);

    const lines: string[] = getGcodeText(toolpath, getContext({ hasAirAssist: true })).split(LINE_BREAK_PATTERN);

    expect(lines.filter((line: string): boolean => line === GCODE_AIR_ASSIST_ON)).toHaveLength(1);
    expect(lines.indexOf(GCODE_AIR_ASSIST_ON)).toBeLessThan(lines.indexOf('G1 X1 Y0 S1000 F300'));
    expect(lines.indexOf(GCODE_AIR_ASSIST_OFF)).toBeGreaterThan(lines.indexOf('G1 X2 Y0'));
    expect(lines.indexOf(GCODE_AIR_ASSIST_OFF)).toBeLessThan(lines.indexOf('G1 X3 Y0'));
  });

  it('closes air assist at the end when the last layer still has it on', () => {
    const toolpath: Toolpath = getToolpath([getMove({ to: { x: 1, y: 0 }, airAssist: true })]);

    const lines: string[] = getGcodeText(toolpath, getContext({ hasAirAssist: true })).split(LINE_BREAK_PATTERN);

    expect(lines.slice(-3)).toEqual([GCODE_AIR_ASSIST_OFF, GCODE_LASER_OFF_END, '']);
  });

  it('writes no air assist command without air assist on the machine', () => {
    const toolpath: Toolpath = getToolpath([getMove({ to: { x: 1, y: 0 }, airAssist: true })]);

    const text: string = getGcodeText(toolpath, getContext({ hasAirAssist: false }));

    expect(text).not.toContain(GCODE_AIR_ASSIST_ON);
    expect(text).not.toContain(GCODE_AIR_ASSIST_OFF);
  });

  it('maps every point to the origin corner', () => {
    const toolpath: Toolpath = getToolpath([
      getMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, to: { x: 10, y: 20 }, powerPercent: 0 }),
    ]);

    const text: string = getGcodeText(toolpath, getContext({ originCorner: MACHINE_ORIGIN_CORNER.BACK_RIGHT }));

    expect(text).toContain('G0 X390 Y280');
    expect(text).toContain('origin back-right');
  });

  it('writes no executable line from a project or profile name that carries line breaks', () => {
    const toolpath: Toolpath = getToolpath([]);
    const context: GcodeContext = getContext({
      projectName: 'Coasters\nG1 X10 S1000\r\nG1 X200 Y200 S1000 F100',
      profileName: 'Laser\rM3 S1000',
    });

    const lines: string[] = getGcodeText(toolpath, context).split(LINE_BREAK_PATTERN);

    expect(lines.slice(0, 2)).toEqual([
      '; webgrbl 0.1.0 - Coasters G1 X10 S1000  G1 X200 Y200 S1000 F100 - 2026-11-01T00:00:00.000Z',
      '; profile: Laser M3 S1000, S max 1000, origin front-left',
    ]);
    expect(lines.slice(2)).toEqual(['G21 G90', 'M4 S0', GCODE_LASER_OFF_END, '']);
  });

  it('writes the header as printable ASCII for names outside ASCII', () => {
    const context: GcodeContext = getContext({
      projectName: 'Caf\u00E9 \u041A\u043E\u0442 \u2014 (v2); end',
      profileName: 'Lasero \u00FC',
    });

    const headerText: string = getGcodeText(getToolpath([]), context).split(LINE_BREAK_PATTERN).slice(0, 2).join('');

    expect(headerText).toMatch(/^[\x20-\x7E]*$/);
    expect(headerText).toContain('Cafe ___ _ [v2], end');
    expect(headerText).toContain('profile: Lasero u,');
  });
});
