/**
 * Gets the path text of a run of moves of one burn path group. It always starts with a move to the run's first point
 * (added when the first move continues the previous one), so the text can be drawn as a path of its own; an empty run
 * gives an empty text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getToolpathPathPointText } from './get.toolpath.path.point.text';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import type { ToolpathMoveRange } from './interfaces/ToolpathMoveRange';
import type { ToolpathStrokePath } from './interfaces/ToolpathStrokePath';
import { SVG_PATH_MOVE_TO } from './toolpath.drawing.constants';

export const getToolpathMovesPathText = (
  strokePath: ToolpathStrokePath,
  moves: ToolpathMove[],
  { firstMoveCount, endMoveCount }: ToolpathMoveRange,
): string => {
  if (endMoveCount <= firstMoveCount) {
    return '';
  }

  const firstMove: ToolpathMove | undefined = moves[strokePath.moveIndices[firstMoveCount] ?? -1];
  const runText: string = strokePath.moveTexts.slice(firstMoveCount, endMoveCount).join('');

  if (!firstMove) {
    return '';
  }

  return runText.startsWith(SVG_PATH_MOVE_TO)
    ? runText
    : SVG_PATH_MOVE_TO + getToolpathPathPointText(firstMove.from) + runText;
};
