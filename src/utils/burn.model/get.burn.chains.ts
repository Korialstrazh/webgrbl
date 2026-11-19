/**
 * Gets the runs of burning moves on enabled Line-mode layers. A travel, a zero-power move or a change of layer ends a
 * run. So does a return to the exact start: passes and identical outlines repeat with no travel between them, because
 * the head is already there, and they must still count as separate chains so their doses add.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { MOVE_MIN_LENGTH_MM, TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { CUT_CLOSED_GAP_MM, CUT_CLOSED_MIN_ENCLOSED_AREA_MM2 } from './burn.model.constants';
import type { BurnChain } from './interfaces/BurnChain';

const SHOELACE_AREA_DIVISOR = 2;

const getEnabledLineLayerKeys = (layers: ProjectLayer[]): Set<string> => new Set<string>(
  layers
    .filter((layer: ProjectLayer): boolean => layer.enabled && layer.settings.mode === LAYER_MODE.LINE)
    .map((layer: ProjectLayer): string => getLayerKey(layer)),
);

const isLineBurnMove = (move: ToolpathMove, lineLayerKeys: Set<string>): boolean =>
  move.kind === TOOLPATH_MOVE_KIND.BURN && move.powerPercent > 0 && lineLayerKeys.has(move.layerKey);

const getPointDistanceMm = (firstPoint: GeometryPoint, secondPoint: GeometryPoint): number =>
  Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y);

/** The area the moves enclose, by the shoelace formula, with the gap back to the start counted as a straight line. */
const getChainEnclosedAreaMm2 = (moves: ToolpathMove[], startPoint: GeometryPoint): number => {
  let doubledSignedArea = 0;

  for (const { from, to } of moves) {
    const fromX: number = from.x - startPoint.x;
    const fromY: number = from.y - startPoint.y;

    doubledSignedArea += fromX * (to.y - startPoint.y) - (to.x - startPoint.x) * fromY;
  }

  return Math.abs(doubledSignedArea) / SHOELACE_AREA_DIVISOR;
};

const isChainClosed = (moves: ToolpathMove[], startPoint: GeometryPoint, endPoint: GeometryPoint): boolean =>
  getPointDistanceMm(startPoint, endPoint) <= CUT_CLOSED_GAP_MM
  && getChainEnclosedAreaMm2(moves, startPoint) > CUT_CLOSED_MIN_ENCLOSED_AREA_MM2;

const newBurnChain = (moves: ToolpathMove[], firstMove: ToolpathMove, lastMove: ToolpathMove): BurnChain => ({
  layerKey: firstMove.layerKey,
  moves,
  isClosed: isChainClosed(moves, firstMove.from, lastMove.to),
});

export const getBurnChains = (toolpath: Toolpath, layers: ProjectLayer[]): BurnChain[] => {
  const lineLayerKeys: Set<string> = getEnabledLineLayerKeys(layers);
  const chains: BurnChain[] = [];
  let chainMoves: ToolpathMove[] = [];

  const finishChain = (): void => {
    const firstMove: ToolpathMove | undefined = chainMoves[0];
    const lastMove: ToolpathMove | undefined = chainMoves.at(-1);

    if (firstMove && lastMove) {
      chains.push(newBurnChain(chainMoves, firstMove, lastMove));
    }

    chainMoves = [];
  };

  for (const move of toolpath.moves) {
    if (!isLineBurnMove(move, lineLayerKeys)) {
      finishChain();

      continue;
    }

    if (chainMoves[0]?.layerKey !== move.layerKey) {
      finishChain();
    }

    chainMoves.push(move);

    if (getPointDistanceMm(move.to, chainMoves[0]?.from ?? move.from) < MOVE_MIN_LENGTH_MM) {
      finishChain();
    }
  }

  finishChain();

  return chains;
};
