import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { LAYER_MODE, DEFAULT_PALETTE } from '../palette/palette.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import { getLineMoves } from './get.line.moves';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { getBoxSubpath } from './test.support/get.box.subpath';
import { newBedDrawable } from './test.support/new.bed.drawable';
import { newDrawablePaint } from './test.support/new.drawable.paint';
import { newSvgPaint } from './test.support/new.svg.paint';
import { TOOLPATH_MOVE_KIND, TOOLPATH_START_POINT } from './toolpath.constants';

const RED = '#ff0000';
const BLUE = '#0000ff';
const BLACK = '#000000';
const WHITE = '#ffffff';
const CUT_POWER_PERCENT = 100;

const CIRCLE_POINT_COUNT = 100;
const CIRCLE_GRID_COLUMNS = 50;
const CIRCLE_GRID_ROWS = 40;
const CIRCLE_SPACING_MM = 5;
const CIRCLE_RADIUS_MM = 2;
const CUT_PASSES = 3;
// About 1 s alone, but over 3 s when the full suite loads the machine. The limit only has to catch a much slower order.
const LARGE_JOB_TIME_LIMIT_MS = 10_000;

/** The Cut layer with one pass, so each test sees one burn of every outline. */
const getCutLayer = (): ProjectLayer => {
  const cutLayer: ProjectLayer = getNewLayer(RED, DEFAULT_PALETTE, 0);

  return { ...cutLayer, settings: { ...cutLayer.settings, passes: 1 } };
};

const getCircleSubpath = (centre: GeometryPoint): SvgSubpath => ({
  points: Array.from({ length: CIRCLE_POINT_COUNT }, (_point: unknown, pointIndex: number): GeometryPoint => ({
    x: centre.x + CIRCLE_RADIUS_MM * Math.cos((-pointIndex * 2 * Math.PI) / CIRCLE_POINT_COUNT),
    y: centre.y + CIRCLE_RADIUS_MM * Math.sin((-pointIndex * 2 * Math.PI) / CIRCLE_POINT_COUNT),
  })),
  isClosed: true,
});

const getStrokedDrawable = (subpaths: SvgSubpath[], colour: string, paintOrder: number): BedDrawable =>
  newBedDrawable({ subpaths, paint: newDrawablePaint({ stroke: newSvgPaint({ colour }) }), paintOrder });

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
      paint: newDrawablePaint({ fill: newSvgPaint({ colour: RED }), stroke: undefined, strokeWidth: 1 }),
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
      drawables: [getStrokedDrawable([square], BLACK, 0), getStrokedDrawable([square], WHITE, 1)],
      layer: lineShadingLayer,
      startPoint: TOOLPATH_START_POINT,
    });

    expect(getBurnMoves(moves).map((move: ToolpathMove) => move.powerPercent)).toEqual([60, 60, 60, 60]);
  });

  it('burns the outline of a fill on the layer even when the stroke belongs to another layer', () => {
    const redFillBlackStroke: BedDrawable = newBedDrawable({
      subpaths: [getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 })],
      paint: newDrawablePaint({ fill: newSvgPaint({ colour: RED }), stroke: newSvgPaint({ colour: BLACK }) }),
    });

    const moves: ToolpathMove[] = getLineMoves({
      drawables: [redFillBlackStroke],
      layer: getCutLayer(),
      startPoint: TOOLPATH_START_POINT,
    });

    expect(getBurnMoves(moves)).toHaveLength(4);
  });

  it('burns an outline once when both its fill and its stroke belong to the layer', () => {
    const redFillRedStroke: BedDrawable = newBedDrawable({
      subpaths: [getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 })],
      paint: newDrawablePaint({ fill: newSvgPaint({ colour: RED }), stroke: newSvgPaint({ colour: RED }) }),
    });

    const moves: ToolpathMove[] = getLineMoves({
      drawables: [redFillRedStroke],
      layer: getCutLayer(),
      startPoint: TOOLPATH_START_POINT,
    });

    expect(getBurnMoves(moves)).toHaveLength(4);
  });

  it('burns an open score line inside a cut outline before the cut', () => {
    const cutSquare: SvgSubpath = getBoxSubpath({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    const scoreLine: SvgSubpath = { points: [{ x: 40, y: 50 }, { x: 60, y: 50 }], isClosed: false };

    const moves: ToolpathMove[] = getLineMoves({
      drawables: [getStrokedDrawable([cutSquare, scoreLine], RED, 0)],
      layer: getCutLayer(),
      startPoint: TOOLPATH_START_POINT,
    });

    expect(getBurnMoves(moves)[0]?.to).toEqual({ x: 60, y: 50 });
  });

  it('orders 2,000 circles once and burns each exactly once per pass within the time limit', () => {
    const circles: SvgSubpath[] = [];

    for (let row = 0; row < CIRCLE_GRID_ROWS; row++) {
      for (let column = 0; column < CIRCLE_GRID_COLUMNS; column++) {
        circles.push(getCircleSubpath({ x: column * CIRCLE_SPACING_MM, y: row * CIRCLE_SPACING_MM }));
      }
    }

    const cutLayer: ProjectLayer = getNewLayer(RED, DEFAULT_PALETTE, 0);
    const startTime: number = performance.now();
    const moves: ToolpathMove[] = getLineMoves({
      drawables: [getStrokedDrawable(circles, RED, 0)],
      layer: cutLayer,
      startPoint: TOOLPATH_START_POINT,
    });
    const elapsedMs: number = performance.now() - startTime;
    const travelTargets: string[] = moves
      .filter((move: ToolpathMove): boolean => move.kind === TOOLPATH_MOVE_KIND.TRAVEL)
      .map((move: ToolpathMove): string => `${move.to.x},${move.to.y}`);

    expect(cutLayer.settings.passes).toBe(CUT_PASSES);
    expect(elapsedMs).toBeLessThan(LARGE_JOB_TIME_LIMIT_MS);
    expect(getBurnMoves(moves)).toHaveLength(CUT_PASSES * circles.length * CIRCLE_POINT_COUNT);
    expect(travelTargets).toHaveLength(CUT_PASSES * circles.length);
    expect(new Set(travelTargets.slice(0, circles.length)).size).toBe(circles.length);
    expect(travelTargets.slice(circles.length, 2 * circles.length)).toEqual(travelTargets.slice(0, circles.length));
  });
});
