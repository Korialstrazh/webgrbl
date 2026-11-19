/**
 * Gets how long each layer of a toolpath burns, in burn order: the planned durations of its burn moves (overscan
 * included), from the start times of the timeline. Travel is left out, so the shares compare the work of the layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MotionTimeline } from './interfaces/MotionTimeline';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathLayerBurnTime } from './interfaces/ToolpathLayerBurnTime';
import type { ToolpathLayerRange } from './interfaces/ToolpathLayerRange';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

/** The planned duration of one move: up to the start of the next one, or to the end of the job for the last. */
const getMoveDurationS = (timeline: MotionTimeline, moveIndex: number): number => {
  const startTimeS: number | undefined = timeline.moveStartTimesS[moveIndex];
  const endTimeS: number = timeline.moveStartTimesS[moveIndex + 1] ?? timeline.totalTimeS;

  // eslint-disable-next-line no-restricted-syntax -- a move starting at second 0 is planned, distinct from no plan
  return startTimeS === undefined ? 0 : endTimeS - startTimeS;
};

const getLayerBurnTimeS = (toolpath: Toolpath, timeline: MotionTimeline, layer: ToolpathLayerRange): number => {
  let burnTimeS = 0;

  for (let moveIndex = layer.firstMoveIndex; moveIndex <= layer.lastMoveIndex; moveIndex++) {
    if (toolpath.moves[moveIndex]?.kind === TOOLPATH_MOVE_KIND.BURN) {
      burnTimeS += getMoveDurationS(timeline, moveIndex);
    }
  }

  return burnTimeS;
};

export const getToolpathLayerBurnTimes = (toolpath: Toolpath, timeline: MotionTimeline): ToolpathLayerBurnTime[] =>
  toolpath.layers.map((layer: ToolpathLayerRange): ToolpathLayerBurnTime => ({
    layerKey: layer.layerKey,
    burnTimeS: getLayerBurnTimeS(toolpath, timeline, layer),
  }));
