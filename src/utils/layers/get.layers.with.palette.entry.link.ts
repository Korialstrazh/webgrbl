/**
 * Gets the layers with one layer linked to a palette entry and otherwise unchanged. Gives the same list back when
 * the layer is unknown or already linked to that entry.
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

const isLinkNeeded = (layer: ProjectLayer | undefined, paletteEntryId: string): layer is ProjectLayer =>
  Boolean(layer) && layer?.paletteEntryId !== paletteEntryId;

export const getLayersWithPaletteEntryLink = (
  layers: ProjectLayer[],
  layerKey: string,
  paletteEntryId: string,
): ProjectLayer[] => {
  const linkedLayer: ProjectLayer | undefined = layers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey,
  );

  if (!isLinkNeeded(linkedLayer, paletteEntryId)) {
    return layers;
  }

  return layers.map(
    (layer: ProjectLayer): ProjectLayer => (layer === linkedLayer ? { ...layer, paletteEntryId } : layer),
  );
};
