/**
 * Gets the palette entry to save for a layer: the entry it comes from with the layer's current settings, or for a
 * colour that is not in the palette a new entry named after the colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { newPaletteEntry } from '../palette/new.palette.entry';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getPaletteEntryFromLayer = (layer: ProjectLayer, layerEntry: PaletteEntry | undefined): PaletteEntry =>
  layerEntry
    ? { ...layerEntry, ...layer.settings }
    : newPaletteEntry({ name: layer.colour, colour: layer.colour, ...layer.settings });
