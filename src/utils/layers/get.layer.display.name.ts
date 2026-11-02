/**
 * Gets the name shown for a layer: the name of its palette entry, or the colour as hex when the colour is not in the
 * palette.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import type { ProjectLayer } from './interfaces/ProjectLayer';

export const getLayerDisplayName = (layer: ProjectLayer, layerEntry: PaletteEntry | undefined): string =>
  layerEntry ? layerEntry.name : layer.colour;
