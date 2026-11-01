/**
 * Gets the moves of one pass of a fill layer. Lines are scanned in alternating direction, starting left to right, with
 * 2 mm of overscan travel at power 0 before and after the burnt pieces, so the head is at speed while it burns. A gap
 * longer than 5 mm becomes a travel; a shorter gap is crossed at power 0 at the burn feed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getToolpathMoveStyle } from './get.toolpath.move.style';
import type { FillLine } from './interfaces/FillLine';
import type { FillLineScan } from './interfaces/FillLineScan';
import type { FillMovesInput } from './interfaces/FillMovesInput';
import type { FillSegment } from './interfaces/FillSegment';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { FILL_OVERSCAN_MM, FILL_WHITE_TRAVEL_MIN_MM, TRAVEL_POWER_PERCENT } from './toolpath.constants';
import { ToolpathMoveList } from './toolpath.move.list';

const LEFT_TO_RIGHT_DIRECTION = 1;
const RIGHT_TO_LEFT_DIRECTION = -1;
const LINES_PER_DIRECTION_CYCLE = 2;

const getEntryX = (segment: FillSegment, direction: number): number =>
  direction === LEFT_TO_RIGHT_DIRECTION ? segment.x0 : segment.x1;

const getExitX = (segment: FillSegment, direction: number): number =>
  direction === LEFT_TO_RIGHT_DIRECTION ? segment.x1 : segment.x0;

const addSegmentMoves = (moveList: ToolpathMoveList, segment: FillSegment, { y, direction }: FillLineScan): void => {
  const entryX: number = getEntryX(segment, direction);

  if (Math.abs(entryX - moveList.getPosition().x) > FILL_WHITE_TRAVEL_MIN_MM) {
    moveList.addTravelMove({ x: entryX, y });
  } else {
    moveList.addBurnMove({ x: entryX, y }, TRAVEL_POWER_PERCENT);
  }

  moveList.addBurnMove({ x: getExitX(segment, direction), y }, segment.powerPercent);
};

const addFillLineMoves = (moveList: ToolpathMoveList, fillLine: FillLine, direction: number): void => {
  const { y, segments } = fillLine;
  const orderedSegments: FillSegment[] = direction === LEFT_TO_RIGHT_DIRECTION ? segments : [...segments].reverse();
  const firstSegment: FillSegment | undefined = orderedSegments[0];
  const lastSegment: FillSegment | undefined = orderedSegments.at(-1);

  if (!firstSegment || !lastSegment) {
    return;
  }

  const lineStartX: number = getEntryX(firstSegment, direction);

  moveList.addTravelMove({ x: lineStartX - direction * FILL_OVERSCAN_MM, y });
  moveList.addTravelMove({ x: lineStartX, y });

  for (const segment of orderedSegments) {
    addSegmentMoves(moveList, segment, { y, direction });
  }

  moveList.addTravelMove({ x: getExitX(lastSegment, direction) + direction * FILL_OVERSCAN_MM, y });
};

export const getFillMoves = ({ fillLines, layer, startPoint }: FillMovesInput): ToolpathMove[] => {
  const moveList: ToolpathMoveList = new ToolpathMoveList(startPoint, getToolpathMoveStyle(layer));

  fillLines.forEach((fillLine: FillLine, lineIndex: number) => {
    const isLeftToRight: boolean = lineIndex % LINES_PER_DIRECTION_CYCLE === 0;

    addFillLineMoves(moveList, fillLine, isLeftToRight ? LEFT_TO_RIGHT_DIRECTION : RIGHT_TO_LEFT_DIRECTION);
  });

  return moveList.getMoves();
};
