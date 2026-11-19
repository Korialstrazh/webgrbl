/**
 * The changes one edit makes to a palette entry draft.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';

export type PaletteEntryChanges = Partial<Omit<PaletteEntry, 'id'>>;
