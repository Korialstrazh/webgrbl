/**
 * What the PaletteLoaded action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { Palette } from '../../palette/interfaces/Palette';

export interface PalettePayload {
  /** The palette that becomes the current one. */
  palette: Palette;
}
