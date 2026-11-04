/**
 * Gets the layers without those of the sample's colours that no object draws. Such a layer is hidden from the user, so
 * its old mode, switch or place must not decide how a new sample burns: the sample gets a fresh layer instead, and an
 * undo restores the old one with the document snapshot.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';

export const getLayersWithoutUnusedSampleLayers = (
  layers: ProjectLayer[],
  usedLayerKeys: Set<string>,
  cutColour: string,
): ProjectLayer[] =>
  layers.filter((layer: ProjectLayer): boolean => {
    const layerKey: string = getLayerKey(layer);

    return usedLayerKeys.has(layerKey) || (layerKey !== cutColour && layerKey !== SHADING_LAYER_COLOUR);
  });
