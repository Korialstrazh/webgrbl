import { describe, expect, it, vi } from 'vitest';
import { getToolpathDrawing } from './get.toolpath.drawing';
import { getToolpathMovesPathText } from './get.toolpath.moves.path.text';
import { getToolpathStrokePieces } from './get.toolpath.stroke.pieces';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import type { ToolpathStrokePath } from './interfaces/ToolpathStrokePath';
import type { ToolpathStrokePiece } from './interfaces/ToolpathStrokePiece';
import { newToolpath } from './test.support/new.toolpath';
import { newToolpathMove } from './test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';
import { TOOLPATH_BURN_STATE, TOOLPATH_DISPLAY_MODE } from './toolpath.drawing.constants';

const LONG_LAYER_MOVE_COUNT = 2500;
const MIDDLE_MOVE_INDEX = 1500;
const HALF_MOVE_MM = 0.5;
const NO_MOVE_INDEX = -1;
const HALF_POWER_PERCENT = 50;
const CHUNK_BOUNDARY_MOVE_INDEX = 1000;
const FIRST_CHUNK_BURNT_KEY = '0:burnt';
const SECOND_CHUNK_BURNT_KEY = '1:burnt';
const SECOND_CHUNK_REMAINING_KEY = '1:remaining';
const THIRD_CHUNK_REMAINING_KEY = '2:remaining';

type MovesPathTextModule = typeof import('./get.toolpath.moves.path.text');

// The real path text builder, watched, so a test can tell a reused prebuilt chunk from a rebuilt one.
vi.mock(import('./get.toolpath.moves.path.text'), async (importOriginal: () => Promise<MovesPathTextModule>) => {
  const originalModule: MovesPathTextModule = await importOriginal();

  return { getToolpathMovesPathText: vi.fn(originalModule.getToolpathMovesPathText) };
});

const LONG_LAYER_MOVES: ToolpathMove[] = Array.from(
  { length: LONG_LAYER_MOVE_COUNT },
  (_unused: unknown, moveIndex: number): ToolpathMove => newToolpathMove({
    from: { x: moveIndex, y: 0 },
    to: { x: moveIndex + 1, y: 0 },
  }),
);

const getFirstStrokePath = (moves: ToolpathMove[]): ToolpathStrokePath => {
  const [strokePath] = getToolpathDrawing(newToolpath({ moves }), TOOLPATH_DISPLAY_MODE.BY_LAYER).strokePaths;

  if (!strokePath) {
    throw new Error('The toolpath has no burn path');
  }

  // The drawing builds the prebuilt chunks with the same builder; only the calls of the cut itself count.
  vi.mocked(getToolpathMovesPathText).mockClear();

  return strokePath;
};

describe(getToolpathStrokePieces.name, () => {
  it('leaves every chunk of the layer remaining, as its prebuilt text, before its first move', () => {
    const strokePath: ToolpathStrokePath = getFirstStrokePath(LONG_LAYER_MOVES);
    const pieces: ToolpathStrokePiece[] = getToolpathStrokePieces(strokePath, LONG_LAYER_MOVES, {
      point: { x: 0, y: 0 },
      moveIndex: NO_MOVE_INDEX,
      powerPercent: 0,
    });

    expect(pieces.map(({ burnState, pathText }) => ({ burnState, pathText }))).toEqual(strokePath.chunkTexts.map(
      (chunkText: string) => ({ burnState: TOOLPATH_BURN_STATE.REMAINING, pathText: chunkText }),
    ));
    expect(getToolpathMovesPathText).not.toHaveBeenCalled();
  });

  it('splits only the chunk the head is in, inside a move', () => {
    const strokePath: ToolpathStrokePath = getFirstStrokePath(LONG_LAYER_MOVES);
    const pieces: ToolpathStrokePiece[] = getToolpathStrokePieces(strokePath, LONG_LAYER_MOVES, {
      point: { x: MIDDLE_MOVE_INDEX + HALF_MOVE_MM, y: 0 },
      moveIndex: MIDDLE_MOVE_INDEX,
      powerPercent: HALF_POWER_PERCENT,
    });

    expect(pieces).toEqual([
      { pieceKey: FIRST_CHUNK_BURNT_KEY, burnState: TOOLPATH_BURN_STATE.BURNT, pathText: strokePath.chunkTexts[0] },
      {
        pieceKey: SECOND_CHUNK_BURNT_KEY,
        burnState: TOOLPATH_BURN_STATE.BURNT,
        pathText: `M1000 0${strokePath.moveTexts.slice(CHUNK_BOUNDARY_MOVE_INDEX, MIDDLE_MOVE_INDEX).join('')}`
          + 'M1500 0L1500.5 0',
      },
      {
        pieceKey: SECOND_CHUNK_REMAINING_KEY,
        burnState: TOOLPATH_BURN_STATE.REMAINING,
        pathText: `M1500.5 0L1501 0M1501 0${strokePath.moveTexts.slice(MIDDLE_MOVE_INDEX + 1, 2000).join('')}`,
      },
      {
        pieceKey: THIRD_CHUNK_REMAINING_KEY,
        burnState: TOOLPATH_BURN_STATE.REMAINING,
        pathText: strokePath.chunkTexts[2],
      },
    ]);
  });

  it('draws every chunk burnt once the head is at the end of the last move', () => {
    const strokePath: ToolpathStrokePath = getFirstStrokePath(LONG_LAYER_MOVES);
    const pieces: ToolpathStrokePiece[] = getToolpathStrokePieces(strokePath, LONG_LAYER_MOVES, {
      point: { x: LONG_LAYER_MOVE_COUNT, y: 0 },
      moveIndex: LONG_LAYER_MOVE_COUNT - 1,
      powerPercent: HALF_POWER_PERCENT,
    });

    expect(pieces.map(({ burnState }) => burnState))
      .toEqual(strokePath.chunkTexts.map(() => TOOLPATH_BURN_STATE.BURNT));
    expect(pieces.map(({ pathText }) => pathText).join('')).toBe(strokePath.chunkTexts.join(''));
    expect(getToolpathMovesPathText).not.toHaveBeenCalled();
  });

  it('reuses the prebuilt chunk texts when the head stands at the start of a chunk', () => {
    const strokePath: ToolpathStrokePath = getFirstStrokePath(LONG_LAYER_MOVES);
    const pieces: ToolpathStrokePiece[] = getToolpathStrokePieces(strokePath, LONG_LAYER_MOVES, {
      point: { x: CHUNK_BOUNDARY_MOVE_INDEX, y: 0 },
      moveIndex: CHUNK_BOUNDARY_MOVE_INDEX,
      powerPercent: HALF_POWER_PERCENT,
    });

    expect(pieces).toEqual([
      { pieceKey: FIRST_CHUNK_BURNT_KEY, burnState: TOOLPATH_BURN_STATE.BURNT, pathText: strokePath.chunkTexts[0] },
      {
        pieceKey: SECOND_CHUNK_REMAINING_KEY,
        burnState: TOOLPATH_BURN_STATE.REMAINING,
        pathText: strokePath.chunkTexts[1],
      },
      {
        pieceKey: THIRD_CHUNK_REMAINING_KEY,
        burnState: TOOLPATH_BURN_STATE.REMAINING,
        pathText: strokePath.chunkTexts[2],
      },
    ]);
    expect(getToolpathMovesPathText).not.toHaveBeenCalled();
  });

  it('burns the moves of a layer before the head while the head travels', () => {
    const moves: ToolpathMove[] = [
      newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 1, y: 0 } }),
      newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, from: { x: 1, y: 0 }, to: { x: 1, y: 4 }, powerPercent: 0 }),
      newToolpathMove({ from: { x: 1, y: 4 }, to: { x: 2, y: 4 } }),
    ];
    const pieces: ToolpathStrokePiece[] = getToolpathStrokePieces(getFirstStrokePath(moves), moves, {
      point: { x: 1, y: 2 },
      moveIndex: 1,
      powerPercent: 0,
    });

    expect(pieces.map(({ burnState, pathText }) => ({ burnState, pathText }))).toEqual([
      { burnState: TOOLPATH_BURN_STATE.BURNT, pathText: 'M0 0L1 0' },
      { burnState: TOOLPATH_BURN_STATE.REMAINING, pathText: 'M1 4L2 4' },
    ]);
  });
});
