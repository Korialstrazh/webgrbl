import { getToolpath } from './get.toolpath';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { getBoxSubpath } from './test.support/get.box.subpath';
import { newBedDrawable } from './test.support/new.bed.drawable';
import { newSvgPaint } from './test.support/new.svg.paint';
import { FILL_OVERSCAN_MM, TOOLPATH_MOVE_KIND, TRAVEL_POWER_PERCENT } from './toolpath.constants';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { SVG_GRADIENT_KIND, SVG_GRADIENT_UNITS } from '../svg/geometry/svg.geometry.constants';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';

const RED = '#ff0000';
const GREEN = '#00a000';
const WHITE = '#ffffff';
const BLACK = '#000000';
const FILL_SIZE_MM = 10;
const FILL_LINE_COUNT = 101;
const HALF_FILL_MM = 5;
const CUT_PASSES = 3;
const SQUARE_CORNERS = 4;
const SHADING_MAX_PERCENT = 60;
const GREY_LIGHTNESS = (128 * 3) / (255 * 3);

const getCutLayer = (): ProjectLayer => getNewLayer(RED, DEFAULT_PALETTE, 0);
const getFillLayer = (): ProjectLayer => getNewLayer(GREEN, DEFAULT_PALETTE, 1);
const getShadingLayer = (): ProjectLayer => getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0);

const getRedSquare = (paintOrder: number): BedDrawable => newBedDrawable({
  subpaths: [getBoxSubpath({ minX: 10, minY: 10, maxX: 20, maxY: 20 })],
  paint: { fill: undefined, stroke: newSvgPaint({ colour: RED }), strokeWidth: 1 },
  paintOrder,
});

const getFilledBox = (colour: string, minX: number, paintOrder: number): BedDrawable => newBedDrawable({
  subpaths: [getBoxSubpath({ minX, minY: 0, maxX: FILL_SIZE_MM, maxY: FILL_SIZE_MM })],
  paint: { fill: newSvgPaint({ colour }), stroke: undefined, strokeWidth: 1 },
  paintOrder,
});

const getBurnMoves = (toolpath: Toolpath): ToolpathMove[] =>
  toolpath.moves.filter((move: ToolpathMove): boolean => move.kind === TOOLPATH_MOVE_KIND.BURN);

const getLayerBurnMoves = (toolpath: Toolpath, layerKey: string): ToolpathMove[] =>
  getBurnMoves(toolpath).filter((move: ToolpathMove): boolean => move.layerKey === layerKey);

const getBurnLineHeights = (toolpath: Toolpath): number[] =>
  Array.from(new Set(getBurnMoves(toolpath).map((move: ToolpathMove): number => move.to.y)));

const isTravelOverscan = (move: ToolpathMove | undefined, lineY: number): boolean =>
  move?.kind === TOOLPATH_MOVE_KIND.TRAVEL
  && move.powerPercent === TRAVEL_POWER_PERCENT
  && move.from.y === lineY
  && move.to.y === lineY
  && Math.abs(Math.abs(move.to.x - move.from.x) - FILL_OVERSCAN_MM) < 1e-9;

describe(getToolpath.name, () => {
  it('burns a red square on the Cut layer as 3 closed loops at 100 %', () => {
    const toolpath: Toolpath = getToolpath([getRedSquare(0)], [], [getCutLayer()]);
    const loop: GeometryPoint[] = [{ x: 20, y: 10 }, { x: 20, y: 20 }, { x: 10, y: 20 }, { x: 10, y: 10 }];

    expect(toolpath.moves[0]).toMatchObject({
      kind: TOOLPATH_MOVE_KIND.TRAVEL,
      from: { x: 0, y: 0 },
      to: { x: 10, y: 10 },
      powerPercent: TRAVEL_POWER_PERCENT,
    });
    expect(getBurnMoves(toolpath).map((move: ToolpathMove) => move.to)).toEqual([...loop, ...loop, ...loop]);
    expect(getBurnMoves(toolpath).every((move: ToolpathMove): boolean => move.powerPercent === 100)).toBe(true);
    expect(getBurnMoves(toolpath)).toHaveLength(CUT_PASSES * SQUARE_CORNERS);
    expect(toolpath.layers).toEqual([{ layerKey: RED, firstMoveIndex: 0, lastMoveIndex: toolpath.moves.length - 1 }]);
  });

  it('fills a 10 x 10 mm green square at 0.1 mm with 101 lines in alternating direction and 2 mm overscan', () => {
    const toolpath: Toolpath = getToolpath([getFilledBox(GREEN, 0, 0)], [], [getFillLayer()]);
    const burnMoves: ToolpathMove[] = getBurnMoves(toolpath);

    expect(getBurnLineHeights(toolpath)).toHaveLength(FILL_LINE_COUNT);
    expect(burnMoves).toHaveLength(FILL_LINE_COUNT);
    burnMoves.forEach((burnMove: ToolpathMove, lineIndex: number) => {
      const moveIndex: number = toolpath.moves.indexOf(burnMove);
      const isLeftToRight: boolean = lineIndex % 2 === 0;

      expect(burnMove.to.x > burnMove.from.x).toBe(isLeftToRight);
      expect(Math.abs(burnMove.to.x - burnMove.from.x)).toBeCloseTo(FILL_SIZE_MM, 9);
      expect(burnMove.powerPercent).toBe(getFillLayer().settings.maxPowerPercent);
      expect(isTravelOverscan(toolpath.moves[moveIndex - 1], burnMove.to.y)).toBe(true);
      expect(isTravelOverscan(toolpath.moves[moveIndex + 1], burnMove.to.y)).toBe(true);
    });
    expect(toolpath.bounds).toEqual({
      minX: -FILL_OVERSCAN_MM,
      minY: 0,
      maxX: FILL_SIZE_MM + FILL_OVERSCAN_MM,
      maxY: FILL_SIZE_MM,
    });
  });

  it('leaves the half under a white rectangle unburnt while a cut line under the fill still burns', () => {
    const toolpath: Toolpath = getToolpath(
      [getRedSquare(0), getFilledBox(GREEN, 0, 1), getFilledBox(WHITE, HALF_FILL_MM, 2)],
      [],
      [getCutLayer(), getFillLayer()],
    );
    const fillBurns: ToolpathMove[] = getLayerBurnMoves(toolpath, GREEN);
    const cutBurns: ToolpathMove[] = getLayerBurnMoves(toolpath, RED);

    expect(fillBurns).toHaveLength(FILL_LINE_COUNT);
    expect(fillBurns.every(
      (move: ToolpathMove): boolean => Math.max(move.from.x, move.to.x) <= HALF_FILL_MM,
    )).toBe(true);
    expect(cutBurns).toHaveLength(CUT_PASSES * SQUARE_CORNERS);
  });

  it('burns grey #808080 in the shading layer at the power of its lightness', () => {
    const toolpath: Toolpath = getToolpath([getFilledBox('#808080', 0, 0)], [], [getShadingLayer()]);

    expect(getBurnMoves(toolpath)[0]?.powerPercent).toBeCloseTo(SHADING_MAX_PERCENT * (1 - GREY_LIGHTNESS), 6);
    expect(getBurnMoves(toolpath)[0]?.powerPercent).toBeCloseTo(29.9, 1);
  });

  it('composites 50 % opacity black over white before the shading power', () => {
    const halfBlack: BedDrawable = newBedDrawable({
      subpaths: [getBoxSubpath({ minX: 0, minY: 0, maxX: FILL_SIZE_MM, maxY: FILL_SIZE_MM })],
      paint: { fill: newSvgPaint({ colour: BLACK, opacity: 0.5 }), stroke: undefined, strokeWidth: 1 },
    });

    const toolpath: Toolpath = getToolpath([halfBlack], [], [getShadingLayer()]);

    expect(getBurnMoves(toolpath)[0]?.powerPercent).toBeCloseTo(30, 9);
  });

  it('lowers the power along x for a black to white gradient', () => {
    const gradientBox: BedDrawable = newBedDrawable({
      subpaths: [getBoxSubpath({ minX: 0, minY: 0, maxX: FILL_SIZE_MM, maxY: FILL_SIZE_MM })],
      paint: {
        fill: newSvgPaint({
          colour: BLACK,
          gradient: {
            kind: SVG_GRADIENT_KIND.LINEAR,
            stops: [{ offset: 0, colour: BLACK, opacity: 1 }, { offset: 1, colour: WHITE, opacity: 1 }],
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 0,
            units: SVG_GRADIENT_UNITS.OBJECT_BOUNDING_BOX,
          },
        }),
        stroke: undefined,
        strokeWidth: 1,
      },
    });

    const toolpath: Toolpath = getToolpath([gradientBox], [], [getShadingLayer()]);
    const firstLineBurns: ToolpathMove[] = getBurnMoves(toolpath).filter(
      (move: ToolpathMove): boolean => move.to.y === 0 && move.powerPercent > 0,
    );
    const firstLinePowers: number[] = firstLineBurns.map((move: ToolpathMove): number => move.powerPercent);

    expect(firstLineBurns.length).toBeGreaterThan(SQUARE_CORNERS);
    expect(firstLinePowers[0]).toBeCloseTo(SHADING_MAX_PERCENT, 0);
    firstLineBurns.slice(1).forEach((move: ToolpathMove, index: number) => {
      expect(move.from.x).toBeGreaterThan(firstLineBurns[index]?.from.x ?? Infinity);
      expect(move.powerPercent).toBeLessThan(firstLinePowers[index] ?? 0);
    });
  });

  it('leaves a disabled layer out entirely', () => {
    const toolpath: Toolpath = getToolpath([getRedSquare(0)], [], [{ ...getCutLayer(), enabled: false }]);

    expect(toolpath).toEqual({ moves: [], layers: [], warnings: [], bounds: undefined });
  });

  it('burns the enabled layers in their order, not in list order', () => {
    const toolpath: Toolpath = getToolpath(
      [getRedSquare(0), getFilledBox(GREEN, 0, 1)],
      [],
      [{ ...getCutLayer(), order: 1 }, { ...getFillLayer(), order: 0 }],
    );

    expect(toolpath.layers.map(({ layerKey }) => layerKey)).toEqual([GREEN, RED]);
    expect(toolpath.layers[1]?.firstMoveIndex).toBe((toolpath.layers[0]?.lastMoveIndex ?? 0) + 1);
  });

  it('passes the warnings of unsupported objects through', () => {
    const warnings: Toolpath['warnings'] = [{ objectId: 'text-object', kind: SVG_UNSUPPORTED_KIND.TEXT }];

    expect(getToolpath([], warnings, [getCutLayer()]).warnings).toEqual(warnings);
  });

  it('contributes nothing for a paint whose colour has no layer', () => {
    const toolpath: Toolpath = getToolpath([getFilledBox('#123456', 0, 0)], [], [getCutLayer(), getFillLayer()]);

    expect(toolpath.moves).toEqual([]);
  });
});
