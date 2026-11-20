/**
 * Gets the toolpath that runs some line layers of a job again at the same work zero, in the job's layer order, with
 * all their passes and, when asked, one extra pass right after each layer. Layers missing from passesByLayerKey (fill
 * layers, which callers leave out) are skipped. Get.toolpath writes the passes of a layer one after another, and every
 * pass after the first has the same moves; the first can have one travel more, so the extra pass copies the last one.
 * Where kept moves do not join up, the head travels with the laser off: a kept travel starts from the head instead,
 * and a travel is put in before a kept burn, so it never burns across the gap.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getToolpathBounds } from './get.toolpath.bounds';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathLayerRange } from './interfaces/ToolpathLayerRange';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { MOVE_MIN_LENGTH_MM, TOOLPATH_MOVE_KIND, TRAVEL_POWER_PERCENT } from './toolpath.constants';

const isSameToolpathPoint = (firstPoint: GeometryPoint, secondPoint: GeometryPoint): boolean =>
  Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y) < MOVE_MIN_LENGTH_MM;

/** Adds the moves one by one, joining a gap before the first with a laser-off travel. */
const addJoinedMoves = (recutMoves: ToolpathMove[], newMoves: ToolpathMove[], startPoint: GeometryPoint): void => {
  for (const move of newMoves) {
    const headPoint: GeometryPoint = recutMoves.at(-1)?.to ?? startPoint;

    if (isSameToolpathPoint(headPoint, move.from)) {
      recutMoves.push(move);
    } else if (move.kind === TOOLPATH_MOVE_KIND.TRAVEL) {
      recutMoves.push({ ...move, from: headPoint });
    } else {
      const gapTravelMove: ToolpathMove = {
        ...move,
        kind: TOOLPATH_MOVE_KIND.TRAVEL,
        from: headPoint,
        to: move.from,
        powerPercent: TRAVEL_POWER_PERCENT,
      };

      recutMoves.push(gapTravelMove, move);
    }
  }
};

/** Every pass after the first has floor(moves / passes) moves; the first pass may hold one travel more. */
const getLastPassMoves = (layerMoves: ToolpathMove[], passes: number): ToolpathMove[] => {
  const passMoveCount: number = Math.floor(layerMoves.length / Math.max(1, passes));

  return layerMoves.slice(layerMoves.length - passMoveCount);
};

export const getRecutToolpath = (
  toolpath: Toolpath,
  layerKeys: string[],
  isExtraPassAdded: boolean,
  passesByLayerKey: Record<string, number>,
): Toolpath => {
  const recutMoves: ToolpathMove[] = [];
  const recutLayers: ToolpathLayerRange[] = [];

  for (const layer of toolpath.layers) {
    const passes: number | undefined = passesByLayerKey[layer.layerKey];

    if (!passes || !layerKeys.includes(layer.layerKey)) {
      continue;
    }

    const firstMoveIndex: number = recutMoves.length;
    const layerMoves: ToolpathMove[] = toolpath.moves.slice(layer.firstMoveIndex, layer.lastMoveIndex + 1);

    addJoinedMoves(recutMoves, layerMoves, toolpath.startPoint);

    if (isExtraPassAdded) {
      addJoinedMoves(recutMoves, getLastPassMoves(layerMoves, passes), toolpath.startPoint);
    }

    recutLayers.push({ layerKey: layer.layerKey, firstMoveIndex, lastMoveIndex: recutMoves.length - 1 });
  }

  return {
    startPoint: toolpath.startPoint,
    moves: recutMoves,
    layers: recutLayers,
    warnings: toolpath.warnings,
    bounds: getToolpathBounds(recutMoves),
  };
};
