/**
 * Gives a colour no palette entry uses: the first candidate colour that is free, or, when every candidate is taken,
 * a computed colour that is free.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from './interfaces/PaletteEntry';
import { getNormalizedColour } from './normalize.colour';
import {
  COLOUR_HEX_DIGIT_COUNT,
  COLOUR_VALUE_COUNT,
  FALLBACK_COLOUR_STEP,
  NEW_PALETTE_ENTRY_COLOUR_CANDIDATES,
} from './palette.constants';

const HEX_COLOUR_PREFIX = '#';
const HEX_RADIX = 16;

const getColourFromValue = (colourValue: number): string =>
  HEX_COLOUR_PREFIX + colourValue.toString(HEX_RADIX).padStart(COLOUR_HEX_DIGIT_COUNT, '0');

export const getUnusedPaletteColour = (entries: PaletteEntry[]): string => {
  const usedColours: Set<string | undefined> =
    new Set(entries.map((entry: PaletteEntry): string | undefined => getNormalizedColour(entry.colour)));
  const freeCandidate: string | undefined = NEW_PALETTE_ENTRY_COLOUR_CANDIDATES.find(
    (candidate: string): boolean => !usedColours.has(candidate),
  );

  if (freeCandidate) {
    return freeCandidate;
  }

  // The step never repeats a colour, so one of the first entries.length + 1 values is free.
  for (let stepCount = 1; stepCount <= entries.length + 1; stepCount++) {
    const computedColour: string = getColourFromValue((stepCount * FALLBACK_COLOUR_STEP) % COLOUR_VALUE_COUNT);

    if (!usedColours.has(computedColour)) {
      return computedColour;
    }
  }

  return getColourFromValue(0);
};
