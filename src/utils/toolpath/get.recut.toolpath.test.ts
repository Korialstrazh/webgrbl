import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getRecutToolpath } from './get.recut.toolpath';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { newToolpath } from './test.support/new.toolpath';
import { newToolpathMove } from './test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND, TRAVEL_POWER_PERCENT } from './toolpath.constants';

const RED = '#ff0000';
const GREEN = '#00ff00';
const BLUE = '#0000ff';
const START: GeometryPoint = { x: 1, y: 2 };
const ORIGIN: GeometryPoint = { x: 0, y: 0 };
const SQUARE: GeometryPoint[] = [ORIGIN, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, ORIGIN];
const FILL_START: GeometryPoint = { x: 50, y: 50 };
const FILL_END: GeometryPoint = { x: 60, y: 50 };
const BLUE_START: GeometryPoint = { x: 30, y: 30 };
const BLUE_END: GeometryPoint = { x: 40, y: 30 };

const getTravel = (from: GeometryPoint, to: GeometryPoint, layerKey: string): ToolpathMove =>
  newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, from, to, layerKey, powerPercent: TRAVEL_POWER_PERCENT });

const getBurn = (from: GeometryPoint, to: GeometryPoint, layerKey: string): ToolpathMove =>
  newToolpathMove({ from, to, layerKey });

const getSquareBurns = (): ToolpathMove[] =>
  SQUARE.slice(1).map((point: GeometryPoint, index: number): ToolpathMove => getBurn(SQUARE[index]!, point, RED));

// Red: one closed square, 2 passes; the second pass has no travel because the head is already at the square.
const RED_MOVES: ToolpathMove[] = [getTravel(START, ORIGIN, RED), ...getSquareBurns(), ...getSquareBurns()];
const GREEN_MOVES: ToolpathMove[] = [getTravel(ORIGIN, FILL_START, GREEN), getBurn(FILL_START, FILL_END, GREEN)];
const BLUE_MOVES: ToolpathMove[] = [getTravel(FILL_END, BLUE_START, BLUE), getBurn(BLUE_START, BLUE_END, BLUE)];
const RED_LAST = RED_MOVES.length - 1;

const TOOLPATH: Toolpath = newToolpath({
  startPoint: START,
  moves: [...RED_MOVES, ...GREEN_MOVES, ...BLUE_MOVES],
  layers: [
    { layerKey: RED, firstMoveIndex: 0, lastMoveIndex: RED_LAST },
    { layerKey: GREEN, firstMoveIndex: RED_LAST + 1, lastMoveIndex: RED_LAST + 2 },
    { layerKey: BLUE, firstMoveIndex: RED_LAST + 3, lastMoveIndex: RED_LAST + 4 },
  ],
});
// Green is a fill layer, so callers leave it out.
const PASSES_BY_LAYER_KEY: Record<string, number> = { [RED]: 2, [BLUE]: 1 };

describe(getRecutToolpath.name, () => {
  it('keeps the given line layers in toolpath order and joins a gap with a travel start', () => {
    const recut: Toolpath = getRecutToolpath(TOOLPATH, [BLUE, GREEN, RED], false, PASSES_BY_LAYER_KEY);

    expect(recut.startPoint).toEqual(START);
    expect(recut.moves).toEqual([...RED_MOVES, { ...BLUE_MOVES[0], from: ORIGIN }, BLUE_MOVES[1]]);
    expect(recut.layers).toEqual([
      { layerKey: RED, firstMoveIndex: 0, lastMoveIndex: RED_LAST },
      { layerKey: BLUE, firstMoveIndex: RED_LAST + 1, lastMoveIndex: RED_LAST + 2 },
    ]);
  });

  it('adds one extra pass right after each layer, taken from its last pass', () => {
    const recut: Toolpath = getRecutToolpath(TOOLPATH, [RED, BLUE], true, PASSES_BY_LAYER_KEY);
    const redCount: number = RED_MOVES.length + SQUARE.length - 1;

    expect(recut.moves).toEqual([
      ...RED_MOVES,
      ...getSquareBurns(),
      { ...BLUE_MOVES[0], from: ORIGIN },
      BLUE_MOVES[1],
      { ...BLUE_MOVES[0], from: BLUE_END },
      BLUE_MOVES[1],
    ]);
    expect(recut.layers).toEqual([
      { layerKey: RED, firstMoveIndex: 0, lastMoveIndex: redCount - 1 },
      { layerKey: BLUE, firstMoveIndex: redCount, lastMoveIndex: redCount + 3 },
    ]);
  });

  it('travels with the laser off before a kept layer that starts with a burn away from the head', () => {
    const blueFirst: Toolpath = newToolpath({
      startPoint: ORIGIN,
      moves: [
        getTravel(ORIGIN, BLUE_START, BLUE),
        getBurn(BLUE_START, BLUE_END, BLUE),
        getBurn(BLUE_END, FILL_START, RED),
      ],
      layers: [
        { layerKey: BLUE, firstMoveIndex: 0, lastMoveIndex: 1 },
        { layerKey: RED, firstMoveIndex: 2, lastMoveIndex: 2 },
      ],
    });

    const recut: Toolpath = getRecutToolpath(blueFirst, [RED], false, { [RED]: 1, [BLUE]: 1 });

    expect(recut.moves).toEqual([getTravel(ORIGIN, BLUE_END, RED), getBurn(BLUE_END, FILL_START, RED)]);
    expect(recut.layers).toEqual([{ layerKey: RED, firstMoveIndex: 0, lastMoveIndex: 1 }]);
  });

  it('ignores fill layers and unknown keys', () => {
    const recut: Toolpath = getRecutToolpath(TOOLPATH, [GREEN, 'missing'], true, PASSES_BY_LAYER_KEY);

    expect(recut.moves).toEqual([]);
    expect(recut.layers).toEqual([]);
    expect(recut.bounds).toBeUndefined();
  });
});
