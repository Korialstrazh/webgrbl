/**
 * Gets the cut settings to offer for the test result: those of the sample's Line layer, else of the first Line layer,
 * else the default Cut.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_CUT_ENTRY, LAYER_MODE } from '../palette/palette.constants';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getSampleCutColour } from './get.sample.cut.colour';
import type { SampleCutSettings } from './interfaces/SampleCutSettings';

const isLineLayer = (layer: ProjectLayer): boolean => layer.settings.mode === LAYER_MODE.LINE;

const getSampleLineLayer = (layers: ProjectLayer[], projectObjects: ProjectObject[]): ProjectLayer | undefined => {
  for (const { svgText } of projectObjects) {
    const cutColour: string | undefined = getSampleCutColour(svgText);
    const lineLayer: ProjectLayer | undefined = layers.find(
      (layer: ProjectLayer): boolean => getLayerKey(layer) === cutColour && isLineLayer(layer),
    );

    if (lineLayer) {
      return lineLayer;
    }
  }

  return undefined;
};

export const getSampleCutSettings = (layers: ProjectLayer[], projectObjects: ProjectObject[]): SampleCutSettings => {
  const lineLayer: ProjectLayer | undefined = getSampleLineLayer(layers, projectObjects) ?? layers.find(isLineLayer);
  const { maxPowerPercent, speedMmPerMin, passes } = lineLayer?.settings ?? DEFAULT_CUT_ENTRY;

  return { powerPercent: maxPowerPercent, speedMmPerMin, passes };
};
