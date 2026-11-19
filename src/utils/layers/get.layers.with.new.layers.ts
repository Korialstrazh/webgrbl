/**
 * Gets the layers with the new layers added whose key is not taken yet; an existing layer always keeps its own
 * settings. Gives the same list back when nothing is added.
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

export const getLayersWithNewLayers = (existingLayers: ProjectLayer[], newLayers: ProjectLayer[]): ProjectLayer[] => {
  const takenKeys: Set<string> = new Set<string>(existingLayers.map(getLayerKey));
  const addedLayers: ProjectLayer[] = [];

  for (const newLayer of newLayers) {
    const newLayerKey: string = getLayerKey(newLayer);

    if (!takenKeys.has(newLayerKey)) {
      takenKeys.add(newLayerKey);
      addedLayers.push(newLayer);
    }
  }

  return addedLayers.length ? [...existingLayers, ...addedLayers] : existingLayers;
};
