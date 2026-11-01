import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Palette } from './interfaces/Palette';
import { DEFAULT_PALETTE, PALETTE_STORAGE_KEY, SHADING_ENTRY_ID } from './palette.constants';
import { PALETTE_STORAGE } from './palette.storage';
import { newPaletteEntry } from './new.palette.entry';
import type { PaletteEntry } from './interfaces/PaletteEntry';

const INVALID_STORED_TEXTS = ['{not json', '"text"', '{"version":2,"entries":[]}', '{"version":1,"entries":[{}]}'];

describe('PALETTE_STORAGE', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips a stored palette', () => {
    const storedPalette: Palette = { version: 1, entries: [newPaletteEntry(), ...DEFAULT_PALETTE.entries] };

    PALETTE_STORAGE.storePalette(storedPalette);

    expect(PALETTE_STORAGE.getStoredPalette()).toEqual(storedPalette);
  });

  it('returns the default palette when nothing is stored', () => {
    expect(PALETTE_STORAGE.getStoredPalette()).toEqual(DEFAULT_PALETTE);
  });

  it.each(INVALID_STORED_TEXTS)('returns the default palette for invalid value %s', (storedText: string) => {
    localStorage.setItem(PALETTE_STORAGE_KEY, storedText);

    expect(PALETTE_STORAGE.getStoredPalette()).toEqual(DEFAULT_PALETTE);
  });

  it('restores the shading entry when the stored palette lacks it', () => {
    const customEntry: PaletteEntry = newPaletteEntry();
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify({ version: 1, entries: [customEntry] }));

    const entries: PaletteEntry[] = PALETTE_STORAGE.getStoredPalette().entries;

    expect(entries[0]).toEqual(customEntry);
    expect(entries.map((entry: PaletteEntry): string => entry.id)).toContain(SHADING_ENTRY_ID);
  });

  it('drops stored entries with values out of range', () => {
    const invalidEntry: PaletteEntry = newPaletteEntry({ passes: 0 });
    localStorage.setItem(
      PALETTE_STORAGE_KEY,
      JSON.stringify({ version: 1, entries: [invalidEntry, ...DEFAULT_PALETTE.entries] }),
    );

    expect(PALETTE_STORAGE.getStoredPalette()).toEqual(DEFAULT_PALETTE);
  });

  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => PALETTE_STORAGE.storePalette(DEFAULT_PALETTE)).not.toThrow();
    expect(PALETTE_STORAGE.getStoredPalette()).toEqual(DEFAULT_PALETTE);
  });
});
