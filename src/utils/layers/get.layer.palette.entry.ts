/**
 * Finds the palette entry a layer comes from: the shading entry for the shading layer, otherwise the entry its id
 * names. Gives undefined for a colour that is not in the palette, or an id the palette no longer has.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { SHADING_ENTRY_ID } from '../palette/palette.constants';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getLayerPaletteEntry = (layer: ProjectLayer, entries: PaletteEntry[]): PaletteEntry | undefined => {
  const entryId: string | undefined = layer.isShading ? SHADING_ENTRY_ID : layer.paletteEntryId;

  return entryId ? entries.find((entry: PaletteEntry): boolean => entry.id === entryId) : undefined;
};
