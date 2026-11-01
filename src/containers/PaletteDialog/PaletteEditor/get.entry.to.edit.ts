/**
 * Picks the entry the form shows: the first palette entry that is not the one that was just deleted. The palette
 * always has the shading entry, which cannot be deleted, so there is always one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { newPaletteEntry } from '../../../utils/palette/new.palette.entry';

export const getEntryToEdit = (entries: PaletteEntry[], deletedEntryId: string | undefined): PaletteEntry =>
  entries.find((entry: PaletteEntry): boolean => entry.id !== deletedEntryId) ?? newPaletteEntry();
