/**
 * What the PaletteEntrySaved action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from '../../palette/interfaces/PaletteEntry';

export interface PaletteEntrySavedPayload {
  /** The entry to add, or to replace when its id already exists. */
  entry: PaletteEntry;
}
