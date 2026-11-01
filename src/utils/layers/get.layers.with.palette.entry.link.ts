/**
 * Gets the layers with one layer linked to a palette entry and otherwise unchanged. Gives the same list back when
 * the layer is unknown or already linked to that entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from './get.layer.key';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getLayersWithPaletteEntryLink = (
  layers: ProjectLayer[],
  layerKey: string,
  paletteEntryId: string,
): ProjectLayer[] => {
  const linkedLayer: ProjectLayer | undefined = layers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey,
  );

  if (!linkedLayer || linkedLayer.paletteEntryId === paletteEntryId) {
    return layers;
  }

  return layers.map(
    (layer: ProjectLayer): ProjectLayer => (layer === linkedLayer ? { ...layer, paletteEntryId } : layer),
  );
};
