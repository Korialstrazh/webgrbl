/**
 * Gets the layers without those of the sample's colours that no object draws. Such a layer is hidden from the user, so
 * its old mode, switch or place must not decide how a new sample burns: the sample gets a fresh layer instead, and an
 * undo restores the old one with the document snapshot.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
