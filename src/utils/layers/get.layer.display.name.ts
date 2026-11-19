/**
 * Gets the name shown for a layer, the one name source for every place that names it: the name of its palette entry,
 * or, when the colour is not in the palette, the plain colour it looks like ("Green"), which is also the name the
 * colour gets when it is added to the palette. A colour with no plain name keeps its hex code.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { i18n } from '../localization/localization';
import { getColourNameKey } from '../palette/get.colour.name.key';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import type { ProjectLayer } from './interfaces/ProjectLayer';

const getUnlistedColourName = (colour: string): string => {
  const colourNameKey: string | undefined = getColourNameKey(colour);

  return colourNameKey ? i18n.t(colourNameKey) : colour;
};

export const getLayerDisplayName = (layer: ProjectLayer, layerEntry: PaletteEntry | undefined): string =>
  layerEntry ? layerEntry.name : getUnlistedColourName(layer.colour);
