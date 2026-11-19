import { getResumeToolpath } from './get.resume.toolpath';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { newToolpath } from './test.support/new.toolpath';
import { newToolpathMove } from './test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND, TRAVEL_POWER_PERCENT } from './toolpath.constants';

const RED = '#ff0000';
const BLUE = '#0000ff';
const START = { x: 1, y: 2 };

const MOVES: ToolpathMove[] = [
  newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, from: START, to: { x: 0, y: 0 }, powerPercent: 0 }),
  newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 10, y: 0 } }),
  newToolpathMove({ from: { x: 10, y: 0 }, to: { x: 10, y: 10 }, layerKey: BLUE, airAssist: true }),
  newToolpathMove({ from: { x: 10, y: 10 }, to: { x: 0, y: 10 }, layerKey: BLUE, airAssist: true }),
];

const TOOLPATH: Toolpath = newToolpath({
  startPoint: START,
  moves: MOVES,
  layers: [
    { layerKey: RED, firstMoveIndex: 0, lastMoveIndex: 1 },
    { layerKey: BLUE, firstMoveIndex: 2, lastMoveIndex: 3 },
  ],
  warnings: [],
  bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
});

describe(getResumeToolpath.name, () => {
  it('travels with the laser off from the start point to the resume move, then runs the rest', () => {
    const resumed: Toolpath = getResumeToolpath(TOOLPATH, 2);

    expect(resumed.moves).toEqual([
      {
        ...MOVES[2],
        kind: TOOLPATH_MOVE_KIND.TRAVEL,
        from: START,
        to: { x: 10, y: 0 },
        powerPercent: TRAVEL_POWER_PERCENT,
      },
      MOVES[2],
      MOVES[3],
    ]);
    expect(resumed.startPoint).toEqual(START);
    expect(resumed.bounds).toBe(TOOLPATH.bounds);
    expect(resumed.warnings).toBe(TOOLPATH.warnings);
  });

  it('drops layers before the resume move and lets the first kept layer cover the inserted travel', () => {
    expect(getResumeToolpath(TOOLPATH, 3).layers).toEqual([{ layerKey: BLUE, firstMoveIndex: 0, lastMoveIndex: 1 }]);
    expect(getResumeToolpath(TOOLPATH, 1).layers).toEqual([
      { layerKey: RED, firstMoveIndex: 0, lastMoveIndex: 1 },
      { layerKey: BLUE, firstMoveIndex: 2, lastMoveIndex: 3 },
    ]);
  });

  it('still inserts the travel when the resume move is a travel', () => {
    const resumed: Toolpath = getResumeToolpath(TOOLPATH, 0);

    expect(resumed.moves).toHaveLength(MOVES.length + 1);
    expect(resumed.moves[0]?.kind).toBe(TOOLPATH_MOVE_KIND.TRAVEL);
  });

  it('throws a RangeError for a move index outside the toolpath', () => {
    expect(() => getResumeToolpath(TOOLPATH, -1)).toThrow(RangeError);
    expect(() => getResumeToolpath(TOOLPATH, MOVES.length)).toThrow(RangeError);
    expect(() => getResumeToolpath(TOOLPATH, 1.5)).toThrow(RangeError);
  });
});
