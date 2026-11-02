/**
 * What the PaletteLoaded action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { Palette } from '../../palette/interfaces/Palette';

export interface PalettePayload {
  /** The palette that becomes the current one. */
  palette: Palette;
}
