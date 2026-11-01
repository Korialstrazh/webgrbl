import { getLineMoves } from './get.line.moves';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { getBoxSubpath } from './test.support/get.box.subpath';
import { newBedDrawable } from './test.support/new.bed.drawable';
import { newSvgPaint } from './test.support/new.svg.paint';
import { TOOLPATH_MOVE_KIND, TOOLPATH_START_POINT } from './toolpath.constants';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { LAYER_MODE, DEFAULT_PALETTE } from '../palette/palette.constants';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';

const RED = '#ff0000';
const BLUE = '#0000ff';
const CUT_POWER_PERCENT = 100;

const getCutLayer = (): ProjectLayer => getNewLayer(RED, DEFAULT_PALETTE, 0);

const getStrokedDrawable = (subpaths: SvgSubpath[], colour: string, paintOrder: number): BedDrawable =>
  newBedDrawable({ subpaths, paint: { fill: undefined, stroke: newSvgPaint({ colour }), strokeWidth: 1 }, paintOrder });

const getBurnMoves = (moves: ToolpathMove[]): ToolpathMove[] =>
  moves.filter((move: ToolpathMove): boolean => move.kind === TOOLPATH_MOVE_KIND.BURN);

describe(getLineMoves.name, () => {
  it('burns the inner square before the square around it, even when the outer one is nearer', () => {
    const outerSquare: SvgSubpath = getBoxSubpath({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    const innerSquare: SvgSubpath = getBoxSubpath({ minX: 40, minY: 40, maxX: 60, maxY: 60 });

    const moves: ToolpathMove[] = getLineMoves({
      drawables: [getStrokedDrawable([outerSquare, innerSquare], RED, 0)],
      layer: getCutLayer(),
      startPoint: TOOLPATH_START_POINT,
    });

    expect(getBurnMoves(moves).slice(0, 4).map((move: ToolpathMove) => move.to)).toEqual([
      { x: 60, y: 40 },
      { x: 60, y: 60 },
      { x: 40, y: 60 },
      { x: 40, y: 40 },
    ]);
    expect(getBurnMoves(moves)).toHaveLength(8);
  });

  it('orders shapes nearest first and starts a closed shape at its nearest corner', () => {
    const farSquare: SvgSubpath = getBoxSubpath({ minX: 50, minY: 0, maxX: 60, maxY: 10 });
    const nearSquare: SvgSubpath = getBoxSubpath({ minX: 0, minY: 20, maxX: 10, maxY: 30 });

    const moves: ToolpathMove[] = getLineMoves({
      drawables: [getStrokedDrawable([farSquare], RED, 0), getStrokedDrawable([nearSquare], RED, 1)],
      layer: getCutLayer(),
      startPoint: TOOLPATH_START_POINT,
    });

    expect(moves[0]?.to).toEqual({ x: 0, y: 20 });
    expect(moves.filter((move: ToolpathMove): boolean => move.kind === TOOLPATH_MOVE_KIND.TRAVEL)
      .map((move: ToolpathMove) => move.to)).toEqual([{ x: 0, y: 20 }, { x: 50, y: 10 }]);
  });

  it('burns an open stroke from its nearer end without closing it', () => {
    const openLine: SvgSubpath = { points: [{ x: 30, y: 0 }, { x: 20, y: 0 }, { x: 10, y: 0 }], isClosed: false };

    const moves: ToolpathMove[] = getLineMoves({
      drawables: [getStrokedDrawable([openLine], RED, 0)],
      layer: getCutLayer(),
      startPoint: TOOLPATH_START_POINT,
    });

    expect(moves.map((move: ToolpathMove) => [move.kind, move.to, move.powerPercent])).toEqual([
      [TOOLPATH_MOVE_KIND.TRAVEL, { x: 10, y: 0 }, 0],
      [TOOLPATH_MOVE_KIND.BURN, { x: 20, y: 0 }, CUT_POWER_PERCENT],
      [TOOLPATH_MOVE_KIND.BURN, { x: 30, y: 0 }, CUT_POWER_PERCENT],
    ]);
  });

  it('burns the outline of a filled shape without a stroke when its fill is on the line layer', () => {
    const filledSquare: BedDrawable = newBedDrawable({
      subpaths: [getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 })],
      paint: { fill: newSvgPaint({ colour: RED }), stroke: undefined, strokeWidth: 1 },
    });

    const moves: ToolpathMove[] = getLineMoves({
      drawables: [filledSquare],
      layer: getCutLayer(),
      startPoint: TOOLPATH_START_POINT,
    });

    expect(getBurnMoves(moves)).toHaveLength(4);
  });

  it('ignores shapes of other layers', () => {
    const moves: ToolpathMove[] = getLineMoves({
      drawables: [getStrokedDrawable([getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 })], BLUE, 0)],
      layer: getCutLayer(),
      startPoint: TOOLPATH_START_POINT,
    });

    expect(moves).toEqual([]);
  });

  it('burns grey strokes in a line-mode shading layer at the power of their grey and skips white ones', () => {
    const shadingLayer: ProjectLayer = getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0);
    const lineShadingLayer: ProjectLayer = {
      ...shadingLayer,
      settings: { ...shadingLayer.settings, mode: LAYER_MODE.LINE },
    };
    const square: SvgSubpath = getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 });

    const moves: ToolpathMove[] = getLineMoves({
      drawables: [getStrokedDrawable([square], '#000000', 0), getStrokedDrawable([square], '#ffffff', 1)],
      layer: lineShadingLayer,
      startPoint: TOOLPATH_START_POINT,
    });

    expect(getBurnMoves(moves).map((move: ToolpathMove) => move.powerPercent)).toEqual([60, 60, 60, 60]);
  });
});
