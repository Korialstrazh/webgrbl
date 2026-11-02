/**
 * Builds what the Toolpath view draws of a toolpath, once per toolpath and colour mode, in one pass over the moves:
 *
 * - one burn path group per layer (by layer) or per layer and 10 % power band (power shading), so even 100 000 moves
 *   are a handful of SVG paths instead of one element per move;
 * - each group keeps the path text of every move and the same text joined in chunks of 1 000 moves, so at any time
 *   only the chunk the head is in has to be rebuilt;
 * - the travel path: every move that burns nothing, including overscan at power 0.
 *
 * Coordinates stay in bed millimetres with Y up; the view flips them once with a transform.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getToolpathMovesPathText } from './get.toolpath.moves.path.text';
import { getToolpathPathPointText } from './get.toolpath.path.point.text';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathDrawing } from './interfaces/ToolpathDrawing';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import type { ToolpathStrokePath } from './interfaces/ToolpathStrokePath';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';
import {
  POWER_BAND_COUNT,
  POWER_BAND_WIDTH_PERCENT,
  SVG_PATH_LINE_TO,
  SVG_PATH_MOVE_TO,
  TOOLPATH_DISPLAY_MODE,
  TOOLPATH_PATH_CHUNK_MOVE_COUNT,
  TOOLPATH_PATH_KEY_SEPARATOR,
} from './toolpath.drawing.constants';
import type { ToolpathDisplayMode } from './toolpath.drawing.constants';

/** A burn move at power 0 (overscan) moves the head without burning, so it is drawn with the travel. */
const isBurningMove = (move: ToolpathMove): boolean => move.kind === TOOLPATH_MOVE_KIND.BURN && move.powerPercent > 0;

/** A move that directly follows the previous move of the same path continues its line; any other starts anew. */
const getMovePathText = (move: ToolpathMove, isFollowingPrevious: boolean): string => {
  const lineText: string = SVG_PATH_LINE_TO + getToolpathPathPointText(move.to);

  return isFollowingPrevious ? lineText : SVG_PATH_MOVE_TO + getToolpathPathPointText(move.from) + lineText;
};

const getPowerBand = (powerPercent: number): number =>
  Math.min(Math.floor(powerPercent / POWER_BAND_WIDTH_PERCENT), POWER_BAND_COUNT - 1);

const getPowerBandOfMode = (move: ToolpathMove, displayMode: ToolpathDisplayMode): number | undefined =>
  (displayMode === TOOLPATH_DISPLAY_MODE.POWER_SHADING ? getPowerBand(move.powerPercent) : undefined);

const getStrokePathKey = (layerKey: string, powerBand: number | undefined): string =>
  // eslint-disable-next-line no-restricted-syntax -- band 0 (the weakest power) is distinct from no band
  (powerBand === undefined ? layerKey : layerKey + TOOLPATH_PATH_KEY_SEPARATOR + powerBand);

/** Each chunk starts with a move to its first point, so it can be drawn as a path of its own. */
const getChunkTexts = (strokePath: ToolpathStrokePath, moves: ToolpathMove[]): string[] => {
  const chunkTexts: string[] = [];

  for (let chunkStart = 0; chunkStart < strokePath.moveTexts.length; chunkStart += TOOLPATH_PATH_CHUNK_MOVE_COUNT) {
    chunkTexts.push(getToolpathMovesPathText(strokePath, moves, {
      firstMoveCount: chunkStart,
      endMoveCount: chunkStart + TOOLPATH_PATH_CHUNK_MOVE_COUNT,
    }));
  }

  return chunkTexts;
};

/** The burn path groups in the order their first move burns, still without their chunk texts. */
const getStrokePathsWithoutChunks = (moves: ToolpathMove[], displayMode: ToolpathDisplayMode): ToolpathStrokePath[] => {
  const strokePathsByKey: Map<string, ToolpathStrokePath> = new Map<string, ToolpathStrokePath>();

  for (const [moveIndex, move] of moves.entries()) {
    if (!isBurningMove(move)) {
      continue;
    }

    const powerBand: number | undefined = getPowerBandOfMode(move, displayMode);
    const pathKey: string = getStrokePathKey(move.layerKey, powerBand);
    const strokePath: ToolpathStrokePath = strokePathsByKey.get(pathKey)
      ?? { pathKey, layerKey: move.layerKey, powerBand, moveIndices: [], moveTexts: [], chunkTexts: [] };
    const isFollowingPrevious: boolean = strokePath.moveIndices[strokePath.moveIndices.length - 1] === moveIndex - 1;

    strokePath.moveIndices.push(moveIndex);
    strokePath.moveTexts.push(getMovePathText(move, isFollowingPrevious));
    strokePathsByKey.set(pathKey, strokePath);
  }

  return Array.from(strokePathsByKey.values());
};

const getTravelPathText = (moves: ToolpathMove[]): string => {
  const travelTexts: string[] = [];
  let lastTravelMoveIndex: number | undefined;

  for (const [moveIndex, move] of moves.entries()) {
    if (!isBurningMove(move)) {
      travelTexts.push(getMovePathText(move, lastTravelMoveIndex === moveIndex - 1));
      lastTravelMoveIndex = moveIndex;
    }
  }

  return travelTexts.join('');
};

export const getToolpathDrawing = (toolpath: Toolpath, displayMode: ToolpathDisplayMode): ToolpathDrawing => ({
  strokePaths: getStrokePathsWithoutChunks(toolpath.moves, displayMode).map(
    (strokePath: ToolpathStrokePath): ToolpathStrokePath => ({
      ...strokePath,
      chunkTexts: getChunkTexts(strokePath, toolpath.moves),
    }),
  ),
  travelPathText: getTravelPathText(toolpath.moves),
});
