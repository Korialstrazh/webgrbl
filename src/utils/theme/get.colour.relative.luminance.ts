/**
 * Gets the WCAG relative luminance of a six-digit hex colour (0 for black, 1 for white), or undefined for a value that
 * is not such a colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BED_COLOUR_PATTERN } from '../bed/bed.colour.constants';

const HEX_PREFIX_LENGTH = 1;
const HEX_DIGITS_PER_CHANNEL = 2;
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const LINEAR_THRESHOLD = 0.03928;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;
/** The weights of red, green and blue in the relative luminance. */
const CHANNEL_WEIGHTS: readonly number[] = [0.2126, 0.7152, 0.0722];

const getLinearChannel = (channelHex: string): number => {
  const channel: number = parseInt(channelHex, HEX_RADIX) / CHANNEL_MAX;

  return channel <= LINEAR_THRESHOLD
    ? channel / LINEAR_DIVISOR
    : Math.pow((channel + GAMMA_OFFSET) / GAMMA_DIVISOR, GAMMA_EXPONENT);
};

export const getColourRelativeLuminance = (hexColour: string): number | undefined => {
  if (!BED_COLOUR_PATTERN.test(hexColour)) {
    return undefined;
  }

  let luminance = 0;

  for (let channelIndex = 0; channelIndex < CHANNEL_WEIGHTS.length; channelIndex++) {
    const start: number = HEX_PREFIX_LENGTH + channelIndex * HEX_DIGITS_PER_CHANNEL;
    const channelHex: string = hexColour.slice(start, start + HEX_DIGITS_PER_CHANNEL);

    luminance += (CHANNEL_WEIGHTS[channelIndex] ?? 0) * getLinearChannel(channelHex);
  }

  return luminance;
};
