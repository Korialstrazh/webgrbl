/**
 * Cuts one burn path group into what the Toolpath view draws at one time: whole chunks before the head are burnt,
 * whole chunks after it remain, and only the chunk the head is in is split into a burnt and a remaining piece. Whole
 * chunks reuse their prebuilt text, so per frame at most one chunk (TOOLPATH_PATH_CHUNK_MOVE_COUNT moves) is rebuilt;
 * a group the head has not reached or has finished, or whose burnt moves end at a chunk start, rebuilds none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getToolpathHeadCut } from './get.toolpath.head.cut';
import { getToolpathMovesPathText } from './get.toolpath.moves.path.text';
import { getToolpathPathPointText } from './get.toolpath.path.point.text';
import type { TimelinePosition } from './interfaces/TimelinePosition';
import type { ToolpathHeadCut } from './interfaces/ToolpathHeadCut';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import type { ToolpathStrokePath } from './interfaces/ToolpathStrokePath';
import type { ToolpathStrokePiece } from './interfaces/ToolpathStrokePiece';
import {
  SVG_PATH_LINE_TO,
  SVG_PATH_MOVE_TO,
  TOOLPATH_BURN_STATE,
  TOOLPATH_PATH_CHUNK_MOVE_COUNT,
  TOOLPATH_PATH_KEY_SEPARATOR,
} from './toolpath.drawing.constants';
import type { ToolpathBurnState } from './toolpath.drawing.constants';

const getLineText = (fromPoint: GeometryPoint, toPoint: GeometryPoint): string =>
  SVG_PATH_MOVE_TO + getToolpathPathPointText(fromPoint) + SVG_PATH_LINE_TO + getToolpathPathPointText(toPoint);

const getPieceKey = (chunkIndex: number, burnState: ToolpathBurnState): string =>
  [chunkIndex, burnState].join(TOOLPATH_PATH_KEY_SEPARATOR);

/** The burnt and remaining pieces of the chunk the head is in; a piece with no moves is left out. */
const getSplitChunkPieces = (
  strokePath: ToolpathStrokePath,
  moves: ToolpathMove[],
  headCut: ToolpathHeadCut,
): ToolpathStrokePiece[] => {
  const { burntMoveCount, splitMove, headPoint } = headCut;
  const chunkIndex: number = Math.floor(burntMoveCount / TOOLPATH_PATH_CHUNK_MOVE_COUNT);
  const chunkStart: number = chunkIndex * TOOLPATH_PATH_CHUNK_MOVE_COUNT;
  const chunkEnd: number = chunkStart + TOOLPATH_PATH_CHUNK_MOVE_COUNT;
  const remainingStart: number = splitMove ? burntMoveCount + 1 : burntMoveCount;
  const burntText: string = getToolpathMovesPathText(strokePath, moves, {
    firstMoveCount: chunkStart,
    endMoveCount: burntMoveCount,
  }) + (splitMove ? getLineText(splitMove.from, headPoint) : '');
  const remainingText: string = (splitMove ? getLineText(headPoint, splitMove.to) : '')
    + getToolpathMovesPathText(strokePath, moves, { firstMoveCount: remainingStart, endMoveCount: chunkEnd });
  const pieces: ToolpathStrokePiece[] = [];

  if (burntText) {
    pieces.push({
      pieceKey: getPieceKey(chunkIndex, TOOLPATH_BURN_STATE.BURNT),
      burnState: TOOLPATH_BURN_STATE.BURNT,
      pathText: burntText,
    });
  }

  if (remainingText) {
    pieces.push({
      pieceKey: getPieceKey(chunkIndex, TOOLPATH_BURN_STATE.REMAINING),
      burnState: TOOLPATH_BURN_STATE.REMAINING,
      pathText: remainingText,
    });
  }

  return pieces;
};

const getWholeChunkPiece = (
  strokePath: ToolpathStrokePath,
  chunkIndex: number,
  burnState: ToolpathBurnState,
): ToolpathStrokePiece => ({
  pieceKey: getPieceKey(chunkIndex, burnState),
  burnState,
  pathText: strokePath.chunkTexts[chunkIndex] ?? '',
});

/**
 * The burn state of the whole chunk the head count falls in when the head does not cut it: the head stands at its
 * first move (nothing of it is burnt) or past its last move (all of it is burnt, as for a finished group). Undefined
 * when the head is inside the chunk, so only then its text has to be rebuilt.
 */
const getUncutChunkBurnState = (
  strokePath: ToolpathStrokePath,
  { burntMoveCount, splitMove }: ToolpathHeadCut,
  chunkIndex: number,
): ToolpathBurnState | undefined => {
  const chunkStart: number = chunkIndex * TOOLPATH_PATH_CHUNK_MOVE_COUNT;
  const chunkEnd: number = Math.min(chunkStart + TOOLPATH_PATH_CHUNK_MOVE_COUNT, strokePath.moveIndices.length);

  if (splitMove) {
    return undefined;
  }

  if (burntMoveCount === chunkStart) {
    return TOOLPATH_BURN_STATE.REMAINING;
  }

  return burntMoveCount === chunkEnd ? TOOLPATH_BURN_STATE.BURNT : undefined;
};

/** The pieces of the chunk the head count falls in: the prebuilt chunk when the head does not cut it. */
const getHeadChunkPieces = (
  strokePath: ToolpathStrokePath,
  moves: ToolpathMove[],
  headCut: ToolpathHeadCut,
  chunkIndex: number,
): ToolpathStrokePiece[] => {
  const uncutBurnState: ToolpathBurnState | undefined = getUncutChunkBurnState(strokePath, headCut, chunkIndex);

  return uncutBurnState
    ? [getWholeChunkPiece(strokePath, chunkIndex, uncutBurnState)]
    : getSplitChunkPieces(strokePath, moves, headCut);
};

export const getToolpathStrokePieces = (
  strokePath: ToolpathStrokePath,
  moves: ToolpathMove[],
  position: TimelinePosition,
): ToolpathStrokePiece[] => {
  const headCut: ToolpathHeadCut = getToolpathHeadCut(strokePath, moves, position);
  const splitChunkIndex: number = Math.floor(headCut.burntMoveCount / TOOLPATH_PATH_CHUNK_MOVE_COUNT);
  const pieces: ToolpathStrokePiece[] = [];

  for (let chunkIndex = 0; chunkIndex < strokePath.chunkTexts.length; chunkIndex++) {
    if (chunkIndex < splitChunkIndex) {
      pieces.push(getWholeChunkPiece(strokePath, chunkIndex, TOOLPATH_BURN_STATE.BURNT));
    } else if (chunkIndex > splitChunkIndex) {
      pieces.push(getWholeChunkPiece(strokePath, chunkIndex, TOOLPATH_BURN_STATE.REMAINING));
    } else {
      pieces.push(...getHeadChunkPieces(strokePath, moves, headCut, chunkIndex));
    }
  }

  return pieces;
};
