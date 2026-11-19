/**
 * The content of the palette dialog: the entry list and the file actions beside the form of the entry being edited.
 * It remembers which entry is edited; the form keeps its own unsaved draft, which a switch to another entry drops. A
 * new entry is in the form but not in the palette until it is saved.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUnusedPaletteColour } from '../../../utils/palette/get.unused.palette.colour';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { newPaletteEntry } from '../../../utils/palette/new.palette.entry';
import { DEFAULT_PALETTE } from '../../../utils/palette/palette.constants';
import type { AppDispatch } from '../../../utils/states/new.store';
import {
  PaletteEntriesReordered,
  PaletteEntryDeleted,
  selectPaletteEntries,
} from '../../../utils/states/palette.state';
import { PaletteEntryForm } from '../PaletteEntryForm';
import { PaletteEntryList } from '../PaletteEntryList';
import { PaletteFileActions } from '../PaletteFileActions';
import { getEntryToEdit } from './get.entry.to.edit';
import styles from './styles.module.scss';

const ENTRY_KEY_SEPARATOR = ':';

export const PaletteEditor = (): ReactNode => {
  const dispatch: AppDispatch = useDispatch();
  const entries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const [shownEntry, setShownEntry] = useState<PaletteEntry>(() => getEntryToEdit(entries, undefined));
  const [newEntryId, setNewEntryId] = useState<string | undefined>(undefined);
  const [resetCount, setResetCount] = useState<number>(0);
  // An entry that left the palette (a reset replaced it) must not stay in the form, or Save would bring it back.
  const isShownEntryGone: boolean =
    shownEntry.id !== newEntryId && !entries.some((entry: PaletteEntry): boolean => entry.id === shownEntry.id);
  const editedEntry: PaletteEntry = isShownEntryGone ? getEntryToEdit(entries, undefined) : shownEntry;
  const otherEntries: PaletteEntry[] = entries.filter((entry: PaletteEntry): boolean => entry.id !== editedEntry.id);

  const selectEntry = (entryId: string): void => {
    const selectedEntry: PaletteEntry | undefined =
      entries.find((entry: PaletteEntry): boolean => entry.id === entryId);

    if (selectedEntry) {
      setNewEntryId(undefined);
      setShownEntry(selectedEntry);
    }
  };

  const createEntry = (): void => {
    const createdEntry: PaletteEntry = newPaletteEntry({ colour: getUnusedPaletteColour(entries) });

    setNewEntryId(createdEntry.id);
    setShownEntry(createdEntry);
  };

  const showDefaultEntry = (): void => {
    setNewEntryId(undefined);
    setShownEntry(getEntryToEdit(DEFAULT_PALETTE.entries, undefined));
    setResetCount(resetCount + 1);
  };

  const deleteEntry = (entryId: string): void => {
    dispatch(new PaletteEntryDeleted({ entryId }));

    if (entryId === editedEntry.id) {
      setNewEntryId(undefined);
      setShownEntry(getEntryToEdit(entries, entryId));
    }
  };

  return (
    <div className={styles.paletteEditor}>
      <div className={styles.sidebar}>
        <PaletteEntryList
          entries={entries}
          editedEntryId={editedEntry.id}
          onSelect={selectEntry}
          onCreate={createEntry}
          onDelete={deleteEntry}
          onReorder={(entryIds: string[]) => dispatch(new PaletteEntriesReordered({ entryIds }))}
        />
        <PaletteFileActions onReset={showDefaultEntry} />
      </div>
      <PaletteEntryForm
        key={[editedEntry.id, resetCount].join(ENTRY_KEY_SEPARATOR)}
        entry={editedEntry}
        otherEntries={otherEntries}
      />
    </div>
  );
};
