import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import { getFillMoves } from './get.fill.moves';
import type { FillLine } from './interfaces/FillLine';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND, TOOLPATH_START_POINT } from './toolpath.constants';

const GREEN = '#00a000';
const POWER_PERCENT = 50;
const FILL_SPEED = 2000;
const WORK_AREA_X_MM = 400;

const getFillLayer = (): ProjectLayer => getNewLayer(GREEN, DEFAULT_PALETTE, 0);

const getMoveSummaries = (moves: ToolpathMove[]): [string, number, number, number][] =>
  moves.map((move: ToolpathMove): [string, number, number, number] => [
    move.kind,
    move.to.x,
    move.to.y,
    move.powerPercent,
  ]);

describe(getFillMoves.name, () => {
  it('scans lines in alternating direction with 2 mm overscan at power 0 and the layer feed on both sides', () => {
    const fillLines: FillLine[] = [
      { y: 0, segments: [{ x0: 10, x1: 20, powerPercent: POWER_PERCENT }] },
      { y: 1, segments: [{ x0: 10, x1: 20, powerPercent: POWER_PERCENT }] },
    ];

    const moves: ToolpathMove[] = getFillMoves({
      fillLines,
      layer: getFillLayer(),
      startPoint: TOOLPATH_START_POINT,
      workAreaXMm: WORK_AREA_X_MM,
    });

    expect(getMoveSummaries(moves)).toEqual([
      [TOOLPATH_MOVE_KIND.TRAVEL, 8, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 10, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 20, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.BURN, 22, 0, 0],
      [TOOLPATH_MOVE_KIND.TRAVEL, 22, 1, 0],
      [TOOLPATH_MOVE_KIND.BURN, 20, 1, 0],
      [TOOLPATH_MOVE_KIND.BURN, 10, 1, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.BURN, 8, 1, 0],
    ]);
    expect(moves.every(
      (move: ToolpathMove): boolean => move.feedMmPerMin === FILL_SPEED && move.layerKey === GREEN,
    )).toBe(true);
  });

  it('travels over a gap longer than 5 mm and crosses a shorter gap at power 0 without leaving the line', () => {
    const fillLines: FillLine[] = [{
      y: 0,
      segments: [
        { x0: 10, x1: 11, powerPercent: POWER_PERCENT },
        { x0: 14, x1: 15, powerPercent: POWER_PERCENT },
        { x0: 21, x1: 22, powerPercent: POWER_PERCENT },
      ],
    }];

    const moves: ToolpathMove[] = getFillMoves({
      fillLines,
      layer: getFillLayer(),
      startPoint: { x: 8, y: 0 },
      workAreaXMm: WORK_AREA_X_MM,
    });

    expect(getMoveSummaries(moves)).toEqual([
      [TOOLPATH_MOVE_KIND.BURN, 10, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 11, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.BURN, 14, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 15, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.TRAVEL, 21, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 22, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.BURN, 24, 0, 0],
    ]);
  });

  it('gives no moves for a layer without lines', () => {
    expect(getFillMoves({
      fillLines: [],
      layer: getFillLayer(),
      startPoint: TOOLPATH_START_POINT,
      workAreaXMm: WORK_AREA_X_MM,
    })).toEqual([]);
  });

  it('repeats every line for each pass of the layer', () => {
    const fillLines: FillLine[] = [{ y: 0, segments: [{ x0: 0, x1: 1, powerPercent: POWER_PERCENT }] }];
    const twoPassLayer: ProjectLayer = { ...getFillLayer(), settings: { ...getFillLayer().settings, passes: 2 } };

    const moves: ToolpathMove[] = getFillMoves({
      fillLines,
      layer: twoPassLayer,
      startPoint: TOOLPATH_START_POINT,
      workAreaXMm: WORK_AREA_X_MM,
    });

    expect(moves.filter((move: ToolpathMove): boolean => move.powerPercent === POWER_PERCENT)).toHaveLength(2);
  });

  it('shortens the overscan to the work area at the left and right edges', () => {
    const fillLines: FillLine[] = [
      { y: 0, segments: [{ x0: 1, x1: WORK_AREA_X_MM - 1, powerPercent: POWER_PERCENT }] },
      { y: 1, segments: [{ x0: 0, x1: WORK_AREA_X_MM, powerPercent: POWER_PERCENT }] },
    ];

    const moves: ToolpathMove[] = getFillMoves({
      fillLines,
      layer: getFillLayer(),
      startPoint: TOOLPATH_START_POINT,
      workAreaXMm: WORK_AREA_X_MM,
    });

    expect(getMoveSummaries(moves)).toEqual([
      [TOOLPATH_MOVE_KIND.BURN, 1, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, WORK_AREA_X_MM - 1, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.BURN, WORK_AREA_X_MM, 0, 0],
      [TOOLPATH_MOVE_KIND.TRAVEL, WORK_AREA_X_MM, 1, 0],
      [TOOLPATH_MOVE_KIND.BURN, 0, 1, POWER_PERCENT],
    ]);
  });

  it('keeps no overscan on a side whose burn edge is already outside the work area', () => {
    const fillLines: FillLine[] = [
      { y: 0, segments: [{ x0: -3, x1: WORK_AREA_X_MM + 3, powerPercent: POWER_PERCENT }] },
    ];

    const moves: ToolpathMove[] = getFillMoves({
      fillLines,
      layer: getFillLayer(),
      startPoint: TOOLPATH_START_POINT,
      workAreaXMm: WORK_AREA_X_MM,
    });

    expect(getMoveSummaries(moves)).toEqual([
      [TOOLPATH_MOVE_KIND.TRAVEL, -3, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, WORK_AREA_X_MM + 3, 0, POWER_PERCENT],
    ]);
  });
});
