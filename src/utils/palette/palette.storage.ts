/**
 * Keeps the palette in localStorage. Storage can be blocked or full, so every access is guarded; a missing or
 * corrupt palette reads as the default and the shading entry is always restored.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getPaletteEntryErrors } from './get.palette.entry.errors';
import type { Palette } from './interfaces/Palette';
import type { PaletteEntry } from './interfaces/PaletteEntry';
import { isPalette } from './is.palette';
import {
  DEFAULT_PALETTE,
  DEFAULT_SHADING_ENTRY,
  PALETTE_STORAGE_KEY,
  PALETTE_VERSION,
  SHADING_ENTRY_ID,
} from './palette.constants';

const isEntryValid = (entry: PaletteEntry): boolean => !getPaletteEntryErrors(entry).length;

const hasShadingEntry = (entries: PaletteEntry[]): boolean =>
  entries.some((entry: PaletteEntry): boolean => entry.id === SHADING_ENTRY_ID);

const getCleanedPalette = (storedPalette: Palette): Palette => {
  const entries: PaletteEntry[] = storedPalette.entries.filter(isEntryValid);

  return {
    version: PALETTE_VERSION,
    entries: hasShadingEntry(entries) ? entries : [...entries, DEFAULT_SHADING_ENTRY],
  };
};

export const PALETTE_STORAGE = {
  getStoredPalette(): Palette {
    try {
      const storedText: string | null = localStorage.getItem(PALETTE_STORAGE_KEY);

      if (!storedText) {
        return DEFAULT_PALETTE;
      }

      const parsedValue: unknown = JSON.parse(storedText);

      return isPalette(parsedValue) ? getCleanedPalette(parsedValue) : DEFAULT_PALETTE;
    } catch {
      return DEFAULT_PALETTE;
    }
  },

  storePalette(palette: Palette): void {
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(palette));
    } catch {
      // Storage can be blocked or full; the palette is then simply not remembered.
    }
  },
};
