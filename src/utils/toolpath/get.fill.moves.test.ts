import { getFillMoves } from './get.fill.moves';
import type { FillLine } from './interfaces/FillLine';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND, TOOLPATH_START_POINT } from './toolpath.constants';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE } from '../palette/palette.constants';

const GREEN = '#00a000';
const POWER_PERCENT = 50;
const FILL_SPEED = 2000;

const getFillLayer = (): ProjectLayer => getNewLayer(GREEN, DEFAULT_PALETTE, 0);

const getMoveSummaries = (moves: ToolpathMove[]): [string, number, number, number][] =>
  moves.map((move: ToolpathMove): [string, number, number, number] => [
    move.kind,
    move.to.x,
    move.to.y,
    move.powerPercent,
  ]);

describe(getFillMoves.name, () => {
  it('scans lines in alternating direction with 2 mm overscan travel on both sides', () => {
    const fillLines: FillLine[] = [
      { y: 0, segments: [{ x0: 10, x1: 20, powerPercent: POWER_PERCENT }] },
      { y: 1, segments: [{ x0: 10, x1: 20, powerPercent: POWER_PERCENT }] },
    ];

    const moves: ToolpathMove[] = getFillMoves({ fillLines, layer: getFillLayer(), startPoint: TOOLPATH_START_POINT });

    expect(getMoveSummaries(moves)).toEqual([
      [TOOLPATH_MOVE_KIND.TRAVEL, 8, 0, 0],
      [TOOLPATH_MOVE_KIND.TRAVEL, 10, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 20, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.TRAVEL, 22, 0, 0],
      [TOOLPATH_MOVE_KIND.TRAVEL, 22, 1, 0],
      [TOOLPATH_MOVE_KIND.TRAVEL, 20, 1, 0],
      [TOOLPATH_MOVE_KIND.BURN, 10, 1, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.TRAVEL, 8, 1, 0],
    ]);
    expect(moves.every(
      (move: ToolpathMove): boolean => move.feedMmPerMin === FILL_SPEED && move.layerKey === GREEN,
    )).toBe(true);
  });

  it('travels over a gap longer than 5 mm and crosses a shorter gap at power 0 without leaving the line', () => {
    const fillLines: FillLine[] = [{
      y: 0,
      segments: [
        { x0: 0, x1: 1, powerPercent: POWER_PERCENT },
        { x0: 4, x1: 5, powerPercent: POWER_PERCENT },
        { x0: 11, x1: 12, powerPercent: POWER_PERCENT },
      ],
    }];

    const moves: ToolpathMove[] = getFillMoves({ fillLines, layer: getFillLayer(), startPoint: { x: -2, y: 0 } });

    expect(getMoveSummaries(moves)).toEqual([
      [TOOLPATH_MOVE_KIND.TRAVEL, 0, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 1, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.BURN, 4, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 5, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.TRAVEL, 11, 0, 0],
      [TOOLPATH_MOVE_KIND.BURN, 12, 0, POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.TRAVEL, 14, 0, 0],
    ]);
  });

  it('gives no moves for a layer without lines', () => {
    expect(getFillMoves({ fillLines: [], layer: getFillLayer(), startPoint: TOOLPATH_START_POINT })).toEqual([]);
  });
});
