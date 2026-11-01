import { getLayerPowerPercent } from './get.layer.power.percent';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { DEFAULT_PALETTE } from '../palette/palette.constants';

const getShadingLayer = (minPowerPercent: number): ProjectLayer => {
  const shadingLayer: ProjectLayer = getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0);

  return { ...shadingLayer, settings: { ...shadingLayer.settings, minPowerPercent } };
};

describe(getLayerPowerPercent.name, () => {
  it('maps lightness onto the power range of the shading layer', () => {
    expect(getLayerPowerPercent(0, getShadingLayer(10))).toBe(60);
    expect(getLayerPowerPercent(0.5, getShadingLayer(10))).toBe(35);
  });

  it('gives no power for white, even with a minimum power', () => {
    expect(getLayerPowerPercent(1, getShadingLayer(10))).toBe(0);
  });

  it('burns a colour layer at its maximum power whatever the lightness', () => {
    expect(getLayerPowerPercent(0.9, getNewLayer('#ff0000', DEFAULT_PALETTE, 0))).toBe(100);
  });
});
