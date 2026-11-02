/**
 * The laser palette: the list of colour entries, in the shape it is stored in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PALETTE_VERSION } from '../palette.constants';
import type { PaletteEntry } from './PaletteEntry';

export interface Palette {
  /** Format version of the stored palette. */
  version: typeof PALETTE_VERSION;
  /** The entries, in the order the user arranged them. */
  entries: PaletteEntry[];
}
