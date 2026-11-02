/**
 * What the palette entry list needs: the entries, the edited one and what to do on each action.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';

export interface PaletteEntryListProps {
  entries: PaletteEntry[];
  /** Id of the entry in the form; a new entry that is not saved yet matches no row. */
  editedEntryId: string;
  onSelect: (entryId: string) => void;
  onCreate: () => void;
  onDelete: (entryId: string) => void;
  onReorder: (entryIds: string[]) => void;
}
