import { EM_DASH } from '../characters.constants';
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import type { GcodeContext } from './interfaces/GcodeContext';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { getGcodeText } from './get.gcode.text';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

const LAYER_KEY = '#ff0000';
const OTHER_LAYER_KEY = '#0000ff';
const S_VALUE_MAX = 1000;
const NON_TRIVIAL_S_VALUE_MAX = 255;
const FEED = 300;
const OTHER_FEED = 600;

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

const getToolpath = (moves: ToolpathMove[]): Toolpath => ({ moves, layers: [], warnings: [], bounds: undefined });

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
        `; webgrbl 0.1.0 ${EM_DASH} Test ${EM_DASH} 2026-11-01T00:00:00.000Z`,
        '; profile: My laser, S max 1000, origin front-left',
        'G21 G90',
        'M4 S0',
        'G0 X10 Y10',
        'G1 X20 Y10 S1000 F300',
        'M5 S0',
        '',
      ].join('\n'),
    );
  });

  it('repeats S and F only when they change', () => {
    const toolpath: Toolpath = getToolpath([
      getMove({ to: { x: 5, y: 0 } }),
      getMove({ from: { x: 5, y: 0 }, to: { x: 5, y: 5 } }),
      getMove({ from: { x: 5, y: 5 }, to: { x: 0, y: 5 }, powerPercent: 0 }),
      getMove({ from: { x: 0, y: 5 }, to: { x: 0, y: 0 }, powerPercent: 50, feedMmPerMin: OTHER_FEED }),
    ]);

    const lines: string[] = getGcodeText(toolpath, getContext()).split('\n');

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

    expect(text).not.toContain('G1');
    expect(text.endsWith('M5 S0\n')).toBe(true);
  });

  it('switches air assist around a layer when the machine has it', () => {
    const toolpath: Toolpath = getToolpath([
      getMove({ to: { x: 1, y: 0 }, airAssist: true }),
      getMove({ from: { x: 1, y: 0 }, to: { x: 2, y: 0 }, airAssist: true }),
      getMove({ from: { x: 2, y: 0 }, to: { x: 3, y: 0 }, layerKey: OTHER_LAYER_KEY }),
    ]);

    const lines: string[] = getGcodeText(toolpath, getContext({ hasAirAssist: true })).split('\n');

    expect(lines.filter((line: string): boolean => line === 'M8')).toHaveLength(1);
    expect(lines.indexOf('M8')).toBeLessThan(lines.indexOf('G1 X1 Y0 S1000 F300'));
    expect(lines.indexOf('M9')).toBeGreaterThan(lines.indexOf('G1 X2 Y0'));
    expect(lines.indexOf('M9')).toBeLessThan(lines.indexOf('G1 X3 Y0'));
  });

  it('closes air assist at the end when the last layer still has it on', () => {
    const toolpath: Toolpath = getToolpath([getMove({ to: { x: 1, y: 0 }, airAssist: true })]);

    const lines: string[] = getGcodeText(toolpath, getContext({ hasAirAssist: true })).split('\n');

    expect(lines.slice(-3)).toEqual(['M9', 'M5 S0', '']);
  });

  it('writes no air assist command without air assist on the machine', () => {
    const toolpath: Toolpath = getToolpath([getMove({ to: { x: 1, y: 0 }, airAssist: true })]);

    const text: string = getGcodeText(toolpath, getContext({ hasAirAssist: false }));

    expect(text).not.toContain('M8');
    expect(text).not.toContain('M9');
  });

  it('maps every point to the origin corner', () => {
    const toolpath: Toolpath = getToolpath([
      getMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, to: { x: 10, y: 20 }, powerPercent: 0 }),
    ]);

    const text: string = getGcodeText(toolpath, getContext({ originCorner: MACHINE_ORIGIN_CORNER.BACK_RIGHT }));

    expect(text).toContain('G0 X390 Y280');
    expect(text).toContain('origin back-right');
  });
});
