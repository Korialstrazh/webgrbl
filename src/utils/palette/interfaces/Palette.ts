/**
 * The laser palette: the list of colour entries, in the shape it is stored in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PALETTE_VERSION } from '../palette.constants';
import type { PaletteEntry } from './PaletteEntry';

export interface Palette {
  /** Format version of the stored palette. */
  version: typeof PALETTE_VERSION;
  /** The entries, in the order the user arranged them. */
  entries: PaletteEntry[];
}
