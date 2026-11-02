import { describe, expect, it } from 'vitest';
import { getToolpathLayerBurnTimes } from './get.toolpath.layer.burn.times';
import type { MotionTimeline } from './interfaces/MotionTimeline';
import type { Toolpath } from './interfaces/Toolpath';
import { newToolpath } from './test.support/new.toolpath';
import { newToolpathMove } from './test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

const RED_LAYER_KEY = '#ff0000';
const BLUE_LAYER_KEY = '#0000ff';
const TOOLPATH: Toolpath = newToolpath({
  moves: [
    newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, powerPercent: 0 }),
    newToolpathMove(),
    newToolpathMove(),
    newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, powerPercent: 0, layerKey: BLUE_LAYER_KEY }),
    newToolpathMove({ layerKey: BLUE_LAYER_KEY }),
  ],
  layers: [
    { layerKey: RED_LAYER_KEY, firstMoveIndex: 0, lastMoveIndex: 2 },
    { layerKey: BLUE_LAYER_KEY, firstMoveIndex: 3, lastMoveIndex: 4 },
  ],
});
// Travel 0-1 s, red burns 1-3 s and 3-6 s, travel 6-10 s, blue burns 10-12 s.
const TIMELINE: MotionTimeline = { moveStartTimesS: [0, 1, 3, 6, 10], moveProfiles: [], totalTimeS: 12 };

describe(getToolpathLayerBurnTimes.name, () => {
  it('sums the burn moves of each layer in burn order and leaves the travel out', () => {
    expect(getToolpathLayerBurnTimes(TOOLPATH, TIMELINE)).toEqual([
      { layerKey: RED_LAYER_KEY, burnTimeS: 5 },
      { layerKey: BLUE_LAYER_KEY, burnTimeS: 2 },
    ]);
  });

  it('gives no layers for a toolpath without layers', () => {
    expect(getToolpathLayerBurnTimes(newToolpath(), { moveStartTimesS: [], moveProfiles: [], totalTimeS: 0 }))
      .toEqual([]);
  });

  it('counts a layer whose moves have no planned time as taking none', () => {
    expect(getToolpathLayerBurnTimes(TOOLPATH, { moveStartTimesS: [], moveProfiles: [], totalTimeS: 0 })).toEqual([
      { layerKey: RED_LAYER_KEY, burnTimeS: 0 },
      { layerKey: BLUE_LAYER_KEY, burnTimeS: 0 },
    ]);
  });
});
