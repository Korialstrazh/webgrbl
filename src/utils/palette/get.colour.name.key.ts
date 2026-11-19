/**
 * Gets the translation key of the plain colour name ("Green", "Blue", ...) nearest to a #rrggbb colour, so a layer
 * whose colour has no palette entry gets a friendly name instead of a raw hex code. Undefined for a colour that is not
 * #rrggbb.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../localization/default.locales';
import { HEX_CHANNEL_DIGITS, HEX_RADIX, LONG_HEX_COLOUR_PATTERN } from './colour.constants';

interface ColourNameReference {
  /** Translation key of the colour name. */
  nameKey: string;
  /** Red, green and blue channels of the colour the name stands for, 0 to 255. */
  channels: readonly [number, number, number];
}

const RED_CHANNEL_START = 1;
const GREEN_CHANNEL_START = RED_CHANNEL_START + HEX_CHANNEL_DIGITS;
const BLUE_CHANNEL_START = GREEN_CHANNEL_START + HEX_CHANNEL_DIGITS;

const COLOUR_NAME_REFERENCES: readonly ColourNameReference[] = [
  { nameKey: DEFAULT.COLOUR_NAME_BLACK, channels: [0, 0, 0] },
  { nameKey: DEFAULT.COLOUR_NAME_GREY, channels: [128, 128, 128] },
  { nameKey: DEFAULT.COLOUR_NAME_WHITE, channels: [255, 255, 255] },
  { nameKey: DEFAULT.COLOUR_NAME_RED, channels: [230, 30, 30] },
  { nameKey: DEFAULT.COLOUR_NAME_ORANGE, channels: [255, 150, 0] },
  { nameKey: DEFAULT.COLOUR_NAME_YELLOW, channels: [255, 230, 0] },
  { nameKey: DEFAULT.COLOUR_NAME_GREEN, channels: [0, 200, 0] },
  { nameKey: DEFAULT.COLOUR_NAME_CYAN, channels: [0, 220, 220] },
  { nameKey: DEFAULT.COLOUR_NAME_BLUE, channels: [0, 60, 230] },
  { nameKey: DEFAULT.COLOUR_NAME_PURPLE, channels: [140, 40, 200] },
  { nameKey: DEFAULT.COLOUR_NAME_PINK, channels: [255, 100, 200] },
  { nameKey: DEFAULT.COLOUR_NAME_BROWN, channels: [140, 80, 30] },
];

const getHexChannel = (hexColour: string, start: number): number =>
  parseInt(hexColour.slice(start, start + HEX_CHANNEL_DIGITS), HEX_RADIX);

export const getColourNameKey = (hexColour: string): string | undefined => {
  if (!LONG_HEX_COLOUR_PATTERN.test(hexColour)) {
    return undefined;
  }

  const red: number = getHexChannel(hexColour, RED_CHANNEL_START);
  const green: number = getHexChannel(hexColour, GREEN_CHANNEL_START);
  const blue: number = getHexChannel(hexColour, BLUE_CHANNEL_START);
  let nearestNameKey: string | undefined;
  let nearestDistance: number = Number.POSITIVE_INFINITY;

  for (const reference of COLOUR_NAME_REFERENCES) {
    const [referenceRed, referenceGreen, referenceBlue] = reference.channels;
    const distance: number = (red - referenceRed) ** 2 + (green - referenceGreen) ** 2 + (blue - referenceBlue) ** 2;

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestNameKey = reference.nameKey;
    }
  }

  return nearestNameKey;
};
