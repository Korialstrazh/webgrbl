/**
 * Gets the palette entry to save for a layer: the entry it comes from with the layer's current settings, or for a
 * colour that is not in the palette a new entry named after the colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { newPaletteEntry } from '../palette/new.palette.entry';
import { getLayerDisplayName } from './get.layer.display.name';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getPaletteEntryFromLayer = (layer: ProjectLayer, layerEntry: PaletteEntry | undefined): PaletteEntry =>
  layerEntry
    ? { ...layerEntry, ...layer.settings }
    : newPaletteEntry({ name: getLayerDisplayName(layer, undefined), colour: layer.colour, ...layer.settings });
