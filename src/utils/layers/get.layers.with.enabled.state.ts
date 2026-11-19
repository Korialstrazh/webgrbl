/**
 * Gets the layers with one layer switched on or off. Gives the same list back when the layer is unknown or already
 * has that state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getLayerKey } from './get.layer.key';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getLayersWithEnabledState = (
  layers: ProjectLayer[],
  layerKey: string,
  enabled: boolean,
): ProjectLayer[] => {
  const switchedLayer: ProjectLayer | undefined = layers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey,
  );

  if (!switchedLayer) {
    return layers;
  }

  if (switchedLayer.enabled === enabled) {
    return layers;
  }

  return layers.map((layer: ProjectLayer): ProjectLayer => (layer === switchedLayer ? { ...layer, enabled } : layer));
};
