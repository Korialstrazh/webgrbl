/**
 * Finds the palette entry, never the shading one, whose colour is closest to a colour by Euclidean RGB distance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getColourChannels } from './get.colour.channels';
import type { ColourChannels } from './interfaces/ColourChannels';
import { DEFAULT_CUT_ENTRY, SHADING_ENTRY_ID } from '../palette/palette.constants';
import type { Palette } from '../palette/interfaces/Palette';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';

const getColourDistance = (firstColour: string, secondColour: string): number => {
  const first: ColourChannels = getColourChannels(firstColour);
  const second: ColourChannels = getColourChannels(secondColour);

  return Math.hypot(first.red - second.red, first.green - second.green, first.blue - second.blue);
};

export const getNearestPaletteEntry = (colour: string, palette: Palette): PaletteEntry => {
  let nearestEntry: PaletteEntry = DEFAULT_CUT_ENTRY;
  let nearestDistance: number = Number.POSITIVE_INFINITY;

  for (const entry of palette.entries) {
    const entryDistance: number = getColourDistance(colour, entry.colour);

    if (entry.id !== SHADING_ENTRY_ID && entryDistance < nearestDistance) {
      nearestEntry = entry;
      nearestDistance = entryDistance;
    }
  }

  return nearestEntry;
};
