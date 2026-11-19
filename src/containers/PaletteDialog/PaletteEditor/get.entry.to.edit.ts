/**
 * Picks the entry the form shows: the first palette entry that is not the one that was just deleted. The palette
 * always has the shading entry, which cannot be deleted, so there is always one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import { newPaletteEntry } from '../../../utils/palette/new.palette.entry';

export const getEntryToEdit = (entries: PaletteEntry[], deletedEntryId: string | undefined): PaletteEntry =>
  entries.find((entry: PaletteEntry): boolean => entry.id !== deletedEntryId) ?? newPaletteEntry();
