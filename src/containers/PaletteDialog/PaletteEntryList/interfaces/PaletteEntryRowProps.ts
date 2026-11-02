/**
 * What one palette row needs: its entry, its place in the list and what to do on each action.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { DragEvent } from 'react';
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';

export interface PaletteEntryRowProps {
  entry: PaletteEntry;
  /** Whether the entry is the one in the form. */
  isEdited: boolean;
  /** Whether the entry is first in the palette, so it cannot move up. */
  isFirst: boolean;
  /** Whether the entry is last in the palette, so it cannot move down. */
  isLast: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (dragEvent: DragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
  onDrop: () => void;
}
