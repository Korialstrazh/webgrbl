import { afterEach, describe, expect, it, vi } from 'vitest';
import * as downloadModule from '../browser/download.text.file';
import { getInkscapePaletteText } from '../palette/get.inkscape.palette.text';
import { newPaletteEntry } from '../palette/new.palette.entry';
import {
  DEFAULT_PALETTE,
  PALETTE_EXPORT_FILE_NAME,
  PALETTE_EXPORT_MIME_TYPE,
  PALETTE_STORAGE_KEY,
  PALETTE_VERSION,
} from '../palette/palette.constants';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { PALETTE_STORAGE } from '../palette/palette.storage';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { watchPalette } from './palette.saga';
import {
  PaletteEntrySaved,
  PaletteExportRequested,
  PaletteResetRequested,
  selectPaletteEntries,
} from './palette.state';

describe(watchPalette.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the stored palette at start', () => {
    const storedEntry: PaletteEntry = newPaletteEntry();
    PALETTE_STORAGE.storePalette({ version: PALETTE_VERSION, entries: [storedEntry] });

    const entries: PaletteEntry[] = selectPaletteEntries(newStore().getState());

    expect(entries[0]).toEqual(storedEntry);
  });

  it('stores the palette after a change and after a reset', () => {
    const store: AppStore = newStore();
    const savedEntry: PaletteEntry = newPaletteEntry();

    store.dispatch(new PaletteEntrySaved({ entry: savedEntry }));
    expect(PALETTE_STORAGE.getStoredPalette().entries).toContainEqual(savedEntry);

    store.dispatch(new PaletteResetRequested());
    expect(localStorage.getItem(PALETTE_STORAGE_KEY)).toBe(JSON.stringify(DEFAULT_PALETTE));
  });

  it('downloads the palette as a plain text file on export', () => {
    const downloadSpy = vi.spyOn(downloadModule, 'downloadTextFile').mockImplementation(() => undefined);

    newStore().dispatch(new PaletteExportRequested());

    expect(downloadSpy).toHaveBeenCalledWith({
      text: getInkscapePaletteText(DEFAULT_PALETTE),
      fileName: PALETTE_EXPORT_FILE_NAME,
      mimeType: PALETTE_EXPORT_MIME_TYPE,
    });
  });
});
