/**
 * The changes one edit makes to a palette entry draft.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';

export type PaletteEntryChanges = Partial<Omit<PaletteEntry, 'id'>>;
