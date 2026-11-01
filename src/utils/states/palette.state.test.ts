import { describe, expect, it } from 'vitest';
import { newPaletteEntry } from '../palette/new.palette.entry';
import {
  CUT_ENTRY_ID,
  DEFAULT_CUT_ENTRY,
  DEFAULT_PALETTE,
  FILL_ENTRY_ID,
  PALETTE_VERSION,
  SHADING_ENTRY_ID,
} from '../palette/palette.constants';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import {
  PaletteEntriesReordered,
  PaletteEntryDeleted,
  PaletteEntrySaved,
  PaletteLoaded,
  PaletteResetRequested,
  selectPalette,
  selectPaletteEntries,
} from './palette.state';

const RENAMED_ENTRY_NAME = 'Renamed';
const CHANGED_PASSES = 7;

const getEntryIds = (store: AppStore): string[] =>
  selectPaletteEntries(store.getState()).map((entry: PaletteEntry): string => entry.id);

describe('palette state', () => {
  it('starts with the default palette', () => {
    expect(selectPalette(newStore().getState())).toEqual(DEFAULT_PALETTE);
  });

  it('adds a new entry and replaces an existing one', () => {
    const store: AppStore = newStore();
    const addedEntry: PaletteEntry = newPaletteEntry();

    store.dispatch(new PaletteEntrySaved({ entry: addedEntry }));
    store.dispatch(new PaletteEntrySaved({ entry: { ...addedEntry, name: RENAMED_ENTRY_NAME } }));
    store.dispatch(new PaletteEntrySaved({ entry: { ...DEFAULT_CUT_ENTRY, passes: CHANGED_PASSES } }));

    const entries: PaletteEntry[] = selectPaletteEntries(store.getState());

    expect(entries).toHaveLength(DEFAULT_PALETTE.entries.length + 1);
    expect(entries.at(-1)?.name).toBe(RENAMED_ENTRY_NAME);
    expect(entries.find((entry: PaletteEntry): boolean => entry.id === CUT_ENTRY_ID)?.passes).toBe(CHANGED_PASSES);
  });

  it('deletes an entry', () => {
    const store: AppStore = newStore();

    store.dispatch(new PaletteEntryDeleted({ entryId: FILL_ENTRY_ID }));

    expect(getEntryIds(store)).not.toContain(FILL_ENTRY_ID);
  });

  it('ignores deleting the shading entry', () => {
    const store: AppStore = newStore();

    store.dispatch(new PaletteEntryDeleted({ entryId: SHADING_ENTRY_ID }));

    expect(selectPalette(store.getState())).toEqual(DEFAULT_PALETTE);
  });

  it('reorders entries, ignores unknown ids and keeps unlisted entries last', () => {
    const store: AppStore = newStore();

    store.dispatch(new PaletteEntriesReordered({ entryIds: [FILL_ENTRY_ID, 'unknown', FILL_ENTRY_ID, CUT_ENTRY_ID] }));

    expect(getEntryIds(store).slice(0, 2)).toEqual([FILL_ENTRY_ID, CUT_ENTRY_ID]);
    expect(getEntryIds(store)).toHaveLength(DEFAULT_PALETTE.entries.length);
  });

  it('loads a palette and resets to the default', () => {
    const store: AppStore = newStore();

    store.dispatch(new PaletteLoaded({ palette: { version: PALETTE_VERSION, entries: [newPaletteEntry()] } }));
    expect(selectPaletteEntries(store.getState())).toHaveLength(1);

    store.dispatch(new PaletteResetRequested());
    expect(selectPalette(store.getState())).toEqual(DEFAULT_PALETTE);
  });
});
