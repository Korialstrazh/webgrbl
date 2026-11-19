/**
 * What the palette entry form needs: the entry to edit and the other entries, whose colours it must not reuse.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';

export interface PaletteEntryFormProps {
  entry: PaletteEntry;
  /** Every entry but the edited one. */
  otherEntries: PaletteEntry[];
}
