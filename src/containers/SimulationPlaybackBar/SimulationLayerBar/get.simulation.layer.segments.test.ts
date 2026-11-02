import { describe, expect, it } from 'vitest';
import { getSimulationLayerSegments } from './get.simulation.layer.segments';

const RED_LAYER_KEY = '#ff0000';
const BLUE_LAYER_KEY = '#0000ff';
const GREEN_LAYER_KEY = '#00a000';

describe(getSimulationLayerSegments.name, () => {
  it('sizes each layer by its share of the burn time and leaves out a layer that burns for no time', () => {
    expect(getSimulationLayerSegments({
      layerBurnTimes: [
        { layerKey: RED_LAYER_KEY, burnTimeS: 1 },
        { layerKey: GREEN_LAYER_KEY, burnTimeS: 0 },
        { layerKey: BLUE_LAYER_KEY, burnTimeS: 3 },
      ],
      projectLayers: [],
      paletteEntries: [],
    })).toEqual([
      { layerKey: RED_LAYER_KEY, layerName: RED_LAYER_KEY, isShading: false, widthPercent: 25 },
      { layerKey: BLUE_LAYER_KEY, layerName: BLUE_LAYER_KEY, isShading: false, widthPercent: 75 },
    ]);
  });

  it('gives no segments when no layer burns for any time', () => {
    expect(getSimulationLayerSegments({
      layerBurnTimes: [{ layerKey: RED_LAYER_KEY, burnTimeS: 0 }],
      projectLayers: [],
      paletteEntries: [],
    })).toEqual([]);
  });
});
