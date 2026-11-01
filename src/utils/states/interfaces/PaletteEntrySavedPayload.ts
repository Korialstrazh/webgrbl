/**
 * What the PaletteEntrySaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../../palette/interfaces/PaletteEntry';

export interface PaletteEntrySavedPayload {
  /** The entry to add, or to replace when its id already exists. */
  entry: PaletteEntry;
}
