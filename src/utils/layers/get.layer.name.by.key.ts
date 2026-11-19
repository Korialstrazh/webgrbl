/**
 * Gets the name the layer list shows for a layer key; the key itself for a layer that is no longer in the document.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { getLayerDisplayName } from './get.layer.display.name';
import { getLayerKey } from './get.layer.key';
import { getLayerPaletteEntry } from './get.layer.palette.entry';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getLayerNameByKey = (
  layerKey: string,
  projectLayers: ProjectLayer[],
  paletteEntries: PaletteEntry[],
): string => {
  const projectLayer: ProjectLayer | undefined = projectLayers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey,
  );

  return projectLayer
    ? getLayerDisplayName(projectLayer, getLayerPaletteEntry(projectLayer, paletteEntries))
    : layerKey;
};
