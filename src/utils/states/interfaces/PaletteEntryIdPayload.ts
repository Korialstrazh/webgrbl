/**
 * What the PaletteEntryDeleted action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../../palette/interfaces/PaletteEntry';

export interface PaletteEntryIdPayload {
  /** Id of the entry the action is about. */
  entryId: PaletteEntry['id'];
}
