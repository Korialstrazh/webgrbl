/**
 * Gets the layers in a new burn order: the listed keys first, in the listed order, then every other layer in its old
 * order. The orders become 0, 1, 2 and so on. Gives the same list back when the order stays the same.
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

const getLayersSortedByOrder = (layers: ProjectLayer[]): ProjectLayer[] =>
  [...layers].sort(
    (firstLayer: ProjectLayer, secondLayer: ProjectLayer): number => firstLayer.order - secondLayer.order,
  );

const getListedLayers = (layers: ProjectLayer[], layerKeys: string[]): ProjectLayer[] => {
  const layersByKey: Map<string, ProjectLayer> = new Map<string, ProjectLayer>(
    layers.map((layer: ProjectLayer): [string, ProjectLayer] => [getLayerKey(layer), layer]),
  );
  const listedLayers: ProjectLayer[] = [];

  for (const layerKey of layerKeys) {
    const listedLayer: ProjectLayer | undefined = layersByKey.get(layerKey);

    if (listedLayer && !listedLayers.includes(listedLayer)) {
      listedLayers.push(listedLayer);
    }
  }

  return listedLayers;
};

const hasSameLayerSequence = (firstLayers: ProjectLayer[], secondLayers: ProjectLayer[]): boolean =>
  firstLayers.every((layer: ProjectLayer, layerIndex: number): boolean => layer === secondLayers[layerIndex]);

export const getLayersInOrder = (layers: ProjectLayer[], layerKeys: string[]): ProjectLayer[] => {
  const listedLayers: ProjectLayer[] = getListedLayers(layers, layerKeys);
  const unlistedLayers: ProjectLayer[] = layers.filter((layer: ProjectLayer): boolean => !listedLayers.includes(layer));
  const reorderedLayers: ProjectLayer[] = [...listedLayers, ...getLayersSortedByOrder(unlistedLayers)];

  if (hasSameLayerSequence(reorderedLayers, getLayersSortedByOrder(layers))) {
    return layers;
  }

  return layers.map((layer: ProjectLayer): ProjectLayer => {
    const burnOrder: number = reorderedLayers.indexOf(layer);

    return layer.order === burnOrder ? layer : { ...layer, order: burnOrder };
  });
};
