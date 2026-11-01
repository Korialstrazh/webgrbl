/**
 * The list of palette entries in palette order, with a button that starts a new entry. Rows reorder by dragging or
 * with their move buttons; a drag that ends without a drop is forgotten.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { DragEvent, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLayerKeysWithMovedLayer } from '../../../utils/layers/get.layer.keys.with.moved.layer';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { PALETTE_DRAG_DATA_TYPE, PALETTE_DRAG_EFFECT } from '../palette.dialog.constants';
import type { PaletteEntryListProps } from './interfaces/PaletteEntryListProps';
import { PaletteEntryRow } from './PaletteEntryRow';
import styles from './styles.module.scss';

export const PaletteEntryList = (props: PaletteEntryListProps): ReactNode => {
  const { entries, editedEntryId, onSelect, onCreate, onDelete, onReorder } = props;
  const { t } = useTranslation();
  const [draggedEntryId, setDraggedEntryId] = useState<string | undefined>(undefined);
  const entryIds: string[] = entries.map((entry: PaletteEntry): string => entry.id);

  const moveEntry = (movedId: string, targetId: string): void => {
    const movedIds: string[] = getLayerKeysWithMovedLayer(entryIds, movedId, targetId);

    if (movedIds !== entryIds) {
      onReorder(movedIds);
    }
  };

  const moveEntryToIndex = (movedId: string, targetIndex: number): void => {
    const targetId: string | undefined = entryIds[targetIndex];

    if (targetId) {
      moveEntry(movedId, targetId);
    }
  };

  const startDrag = (dragEvent: DragEvent<HTMLLIElement>, entryId: string): void => {
    dragEvent.dataTransfer.setData(PALETTE_DRAG_DATA_TYPE, entryId);
    dragEvent.dataTransfer.effectAllowed = PALETTE_DRAG_EFFECT;
    setDraggedEntryId(entryId);
  };

  const dropOnEntry = (targetId: string): void => {
    if (draggedEntryId) {
      moveEntry(draggedEntryId, targetId);
    }

    setDraggedEntryId(undefined);
  };

  return (
    <div className={styles.paletteEntryList}>
      <ul className={styles.list} aria-label={t(DEFAULT.PALETTE_LIST)}>
        {entries.map((entry: PaletteEntry, entryIndex: number) => (
          <PaletteEntryRow
            key={entry.id}
            entry={entry}
            isEdited={entry.id === editedEntryId}
            isFirst={entryIndex === 0}
            isLast={entryIndex === entries.length - 1}
            onSelect={() => onSelect(entry.id)}
            onDelete={() => onDelete(entry.id)}
            onMoveUp={() => moveEntryToIndex(entry.id, entryIndex - 1)}
            onMoveDown={() => moveEntryToIndex(entry.id, entryIndex + 1)}
            onDragStart={(dragEvent: DragEvent<HTMLLIElement>) => startDrag(dragEvent, entry.id)}
            onDragEnd={() => setDraggedEntryId(undefined)}
            onDrop={() => dropOnEntry(entry.id)}
          />
        ))}
      </ul>
      <Button block onClick={onCreate}>{t(DEFAULT.PALETTE_NEW)}</Button>
    </div>
  );
};
