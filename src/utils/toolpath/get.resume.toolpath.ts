/**
 * Gets the toolpath that continues a job from one of its moves: a laser-off travel from the job start to where that
 * move starts, then that move and every move after it. Warnings and bounds stay those of the whole job. The first kept
 * layer range starts at index 0, so it covers the inserted travel and every move still belongs to a layer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathLayerRange } from './interfaces/ToolpathLayerRange';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND, TRAVEL_POWER_PERCENT } from './toolpath.constants';

const getResumeLayerRanges = (layers: ToolpathLayerRange[], firstMoveIndex: number): ToolpathLayerRange[] => {
  const resumeLayers: ToolpathLayerRange[] = [];

  for (const layer of layers) {
    if (layer.lastMoveIndex < firstMoveIndex) {
      continue;
    }

    // The resumed moves sit one index later than in the job because of the inserted travel.
    resumeLayers.push({
      layerKey: layer.layerKey,
      firstMoveIndex: resumeLayers.length ? layer.firstMoveIndex - firstMoveIndex + 1 : 0,
      lastMoveIndex: layer.lastMoveIndex - firstMoveIndex + 1,
    });
  }

  return resumeLayers;
};

export const getResumeToolpath = (toolpath: Toolpath, firstMoveIndex: number): Toolpath => {
  const resumeMove: ToolpathMove | undefined = Number.isInteger(firstMoveIndex)
    ? toolpath.moves[firstMoveIndex]
    : undefined;

  if (!resumeMove) {
    throw new RangeError(`No toolpath move at index ${firstMoveIndex}`);
  }

  const travelMove: ToolpathMove = {
    ...resumeMove,
    kind: TOOLPATH_MOVE_KIND.TRAVEL,
    from: toolpath.startPoint,
    to: resumeMove.from,
    powerPercent: TRAVEL_POWER_PERCENT,
  };

  return {
    ...toolpath,
    moves: [travelMove, ...toolpath.moves.slice(firstMoveIndex)],
    layers: getResumeLayerRanges(toolpath.layers, firstMoveIndex),
  };
};
