/**
 * Builds the layer for a key that no layer has yet: a palette colour gets its entry and is switched on; any other
 * colour gets the nearest entry's settings and is switched off.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerSettings } from './get.layer.settings';
import { getNearestPaletteEntry } from './get.nearest.palette.entry';
import { SHADING_LAYER_COLOUR } from './layer.constants';
import type { ProjectLayer } from './interfaces/ProjectLayer';
import { DEFAULT_SHADING_ENTRY, SHADING_ENTRY_ID } from '../palette/palette.constants';
import type { Palette } from '../palette/interfaces/Palette';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';

const getShadingEntry = (palette: Palette): PaletteEntry =>
  palette.entries.find((entry: PaletteEntry): boolean => entry.id === SHADING_ENTRY_ID) ?? DEFAULT_SHADING_ENTRY;

export const getNewLayer = (layerKey: string, palette: Palette, order: number): ProjectLayer => {
  if (layerKey === SHADING_LAYER_COLOUR) {
    const shadingEntry: PaletteEntry = getShadingEntry(palette);

    return {
      colour: shadingEntry.colour,
      enabled: true,
      order,
      settings: getLayerSettings(shadingEntry),
      paletteEntryId: shadingEntry.id,
      isShading: true,
    };
  }

  const matchingEntry: PaletteEntry | undefined = palette.entries.find(
    (entry: PaletteEntry): boolean => entry.id !== SHADING_ENTRY_ID && entry.colour === layerKey,
  );
  const settingsEntry: PaletteEntry = matchingEntry ?? getNearestPaletteEntry(layerKey, palette);

  return {
    colour: layerKey,
    enabled: Boolean(matchingEntry),
    order,
    settings: getLayerSettings(settingsEntry),
    paletteEntryId: matchingEntry?.id,
    isShading: false,
  };
};
