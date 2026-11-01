/**
 * What the palette entry form needs: the entry to edit and the other entries, whose colours it must not reuse.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';

export interface PaletteEntryFormProps {
  entry: PaletteEntry;
  /** Every entry but the edited one. */
  otherEntries: PaletteEntry[];
}
