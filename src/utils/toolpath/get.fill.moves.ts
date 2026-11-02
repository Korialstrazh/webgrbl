/**
 * Gets the moves of all passes of a fill layer, each pass repeating every line. Lines are scanned in alternating
 * direction, starting left to right, with 2 mm of overscan before and after the burnt pieces, burnt at power 0 and the
 * layer feed so the head is at speed while it burns. The overscan is shortened at the work area edges, so the head
 * never leaves the work area for it (a soft-limit alarm, or a crash into the frame). A gap longer than 5 mm becomes a
 * travel; a shorter gap is crossed at power 0 at the layer feed.
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
import type { FillLineOverscan } from './interfaces/FillLineOverscan';
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

/**
 * The x the overscan beyond burnEdgeX reaches, shortened to stay inside the work area. A burn edge that is itself
 * outside the work area keeps no overscan on that side rather than turning the overscan back.
 */
const getOverscanEndX = (burnEdgeX: number, { direction, workAreaXMm }: FillLineOverscan): number => {
  const fullOverscanX: number = burnEdgeX + direction * FILL_OVERSCAN_MM;

  return Math.min(Math.max(fullOverscanX, Math.min(0, burnEdgeX)), Math.max(workAreaXMm, burnEdgeX));
};

const addFillLineMoves = (moveList: ToolpathMoveList, fillLine: FillLine, overscan: FillLineOverscan): void => {
  const { y, segments } = fillLine;
  const { direction } = overscan;
  const orderedSegments: FillSegment[] = direction === LEFT_TO_RIGHT_DIRECTION ? segments : [...segments].reverse();
  const firstSegment: FillSegment | undefined = orderedSegments[0];
  const lastSegment: FillSegment | undefined = orderedSegments.at(-1);

  if (!firstSegment || !lastSegment) {
    return;
  }

  const lineStartX: number = getEntryX(firstSegment, direction);

  moveList.addTravelMove({ x: getOverscanEndX(lineStartX, { ...overscan, direction: -direction }), y });
  moveList.addBurnMove({ x: lineStartX, y }, TRAVEL_POWER_PERCENT);

  for (const segment of orderedSegments) {
    addSegmentMoves(moveList, segment, { y, direction });
  }

  moveList.addBurnMove({ x: getOverscanEndX(getExitX(lastSegment, direction), overscan), y }, TRAVEL_POWER_PERCENT);
};

export const getFillMoves = ({ fillLines, layer, startPoint, workAreaXMm }: FillMovesInput): ToolpathMove[] => {
  const moveList: ToolpathMoveList = new ToolpathMoveList(startPoint, getToolpathMoveStyle(layer));

  for (let passIndex = 0; passIndex < layer.settings.passes; passIndex++) {
    for (const [lineIndex, fillLine] of fillLines.entries()) {
      const isLeftToRight: boolean = lineIndex % LINES_PER_DIRECTION_CYCLE === 0;

      const direction: number = isLeftToRight ? LEFT_TO_RIGHT_DIRECTION : RIGHT_TO_LEFT_DIRECTION;

      addFillLineMoves(moveList, fillLine, { direction, workAreaXMm });
    }
  }

  return moveList.getMoves();
};
