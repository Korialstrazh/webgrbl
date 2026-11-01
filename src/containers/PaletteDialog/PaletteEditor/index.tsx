/**
 * The content of the palette dialog: the entry list and the file actions beside the form of the entry being edited.
 * It remembers which entry is edited; the form keeps its own unsaved draft, which a switch to another entry drops. A
 * new entry is in the form but not in the palette until it is saved.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { newPaletteEntry } from '../../../utils/palette/new.palette.entry';
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

export const PaletteEditor = (): ReactNode => {
  const dispatch: AppDispatch = useDispatch();
  const entries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const [editedEntry, setEditedEntry] = useState<PaletteEntry>(() => getEntryToEdit(entries, undefined));
  const otherEntries: PaletteEntry[] = entries.filter((entry: PaletteEntry): boolean => entry.id !== editedEntry.id);

  const selectEntry = (entryId: string): void => {
    const selectedEntry: PaletteEntry | undefined =
      entries.find((entry: PaletteEntry): boolean => entry.id === entryId);

    if (selectedEntry) {
      setEditedEntry(selectedEntry);
    }
  };

  const deleteEntry = (entryId: string): void => {
    dispatch(new PaletteEntryDeleted({ entryId }));

    if (entryId === editedEntry.id) {
      setEditedEntry(getEntryToEdit(entries, entryId));
    }
  };

  return (
    <div className={styles.paletteEditor}>
      <div className={styles.sidebar}>
        <PaletteEntryList
          entries={entries}
          editedEntryId={editedEntry.id}
          onSelect={selectEntry}
          onCreate={() => setEditedEntry(newPaletteEntry())}
          onDelete={deleteEntry}
          onReorder={(entryIds: string[]) => dispatch(new PaletteEntriesReordered({ entryIds }))}
        />
        <PaletteFileActions />
      </div>
      <PaletteEntryForm key={editedEntry.id} entry={editedEntry} otherEntries={otherEntries} />
    </div>
  );
};
