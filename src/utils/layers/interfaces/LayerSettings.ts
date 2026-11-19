/**
 * The laser settings of a layer: the palette entry fields without id, name and colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from '../../palette/interfaces/PaletteEntry';

export type LayerSettings = Omit<PaletteEntry, 'id' | 'name' | 'colour'>;
