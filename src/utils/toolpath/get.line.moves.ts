/**
 * Gets the moves of one pass of a line layer: a travel to each outline and burns along it, closed outlines back to
 * their first point. Line-mode outlines are never hidden by paint on top of them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getLinePolylines } from './get.line.polylines';
import { getPolylinesInBurnOrder } from './get.polylines.in.burn.order';
import { getToolpathMoveStyle } from './get.toolpath.move.style';
import type { LineMovesInput } from './interfaces/LineMovesInput';
import type { LinePolyline } from './interfaces/LinePolyline';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { ToolpathMoveList } from './toolpath.move.list';

const addPolylineMoves = (moveList: ToolpathMoveList, polyline: LinePolyline): void => {
  const [firstPoint, ...nextPoints] = polyline.points;

  if (!firstPoint) {
    return;
  }

  moveList.addTravelMove(firstPoint);

  for (const point of nextPoints) {
    moveList.addBurnMove(point, polyline.powerPercent);
  }

  if (polyline.isClosed) {
    moveList.addBurnMove(firstPoint, polyline.powerPercent);
  }
};

export const getLineMoves = ({ drawables, layer, startPoint }: LineMovesInput): ToolpathMove[] => {
  const moveList: ToolpathMoveList = new ToolpathMoveList(startPoint, getToolpathMoveStyle(layer));

  const orderedPolylines: LinePolyline[] = getPolylinesInBurnOrder(getLinePolylines(drawables, layer), startPoint);

  for (let passIndex = 0; passIndex < layer.settings.passes; passIndex++) {
    for (const polyline of orderedPolylines) {
      addPolylineMoves(moveList, polyline);
    }
  }

  return moveList.getMoves();
};
