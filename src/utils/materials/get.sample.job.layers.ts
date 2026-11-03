/**
 * Gets the layers of a project with the test sample in it, by colour like an SVG import: a colour with a layer joins
 * it, and that layer stays exactly as it is. A layer new to the project is made ready for the sample, Line and on for
 * the square and Fill and on for the gradient, even when the palette has no entry that says so.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from '../layers/get.layer.key';
import { getObjectsDerivedLayers } from '../layers/get.objects.derived.layers';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import type { Palette } from '../palette/interfaces/Palette';
import { LAYER_MODE } from '../palette/palette.constants';
import type { LayerMode } from '../palette/palette.constants';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { SAMPLE_CUT_COLOUR } from './sample.job.constants';

const SAMPLE_LAYER_MODES: Readonly<Record<string, LayerMode>> = {
  [SAMPLE_CUT_COLOUR]: LAYER_MODE.LINE,
  [SHADING_LAYER_COLOUR]: LAYER_MODE.FILL,
};

export const getSampleJobLayers = (
  projectObjects: ProjectObject[],
  palette: Palette,
  existingLayers: ProjectLayer[],
): ProjectLayer[] => {
  const existingKeys: Set<string> = new Set<string>(existingLayers.map(getLayerKey));

  return getObjectsDerivedLayers(projectObjects, palette, existingLayers).map((layer: ProjectLayer): ProjectLayer => {
    const layerKey: string = getLayerKey(layer);
    const sampleMode: LayerMode | undefined = SAMPLE_LAYER_MODES[layerKey];

    return existingKeys.has(layerKey) || !sampleMode
      ? layer
      : { ...layer, enabled: true, settings: { ...layer.settings, mode: sampleMode } };
  });
};
