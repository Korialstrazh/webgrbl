/**
 * The laser settings of a layer: the palette entry fields without id, name and colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../../palette/interfaces/PaletteEntry';

export type LayerSettings = Omit<PaletteEntry, 'id' | 'name' | 'colour'>;
