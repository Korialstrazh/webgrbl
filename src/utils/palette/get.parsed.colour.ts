/**
 * Reads a CSS colour with its alpha: everything getNormalizedColour reads, plus transparent, rgba(), hsl(),
 * hsla(), percent rgb() and hex with alpha (#rgba, #rrggbbaa). Gives undefined for anything else.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  COLOUR_ALPHA_ARGUMENT_INDEX,
  COLOUR_CHANNEL_MAX,
  COLOUR_DEGREE_SUFFIX,
  COLOUR_FUNCTION_ARGUMENT_SEPARATOR,
  COLOUR_FUNCTION_PATTERN,
  COLOUR_FUNCTION_RGB_PREFIX,
  COLOUR_PERCENT_SUFFIX,
  HEX_CHANNEL_DIGITS,
  HEX_COLOUR_PREFIX,
  HEX_RADIX,
  HUE_DEGREES_FULL_TURN,
  HUE_SECTOR_DEGREES,
  HUE_SECTOR_MODULO,
  LONG_HEX_ALPHA_COLOUR_PATTERN,
  OPAQUE_ALPHA,
  PERCENT_DIVISOR,
  RGB_ARGUMENT_COUNTS,
  SHORT_HEX_ALPHA_COLOUR_PATTERN,
  TRANSPARENT_COLOUR_NAME,
  TRANSPARENT_COLOUR_RGB,
} from './colour.constants';
import type { ParsedColour } from './interfaces/ParsedColour';
import { getNormalizedColour } from './normalize.colour';

const getChannelsColour = (channels: number[]): string =>
  HEX_COLOUR_PREFIX +
  channels
    .map((channel: number): string =>
      Math.round(channel).toString(HEX_RADIX).padStart(HEX_CHANNEL_DIGITS, '0'),
    )
    .join('');

/** The helpers below give NaN for a part that cannot be read, because 0 is a valid channel and alpha. */
const getPercentFraction = (argument: string): number => {
  const amount: number = Number(argument.slice(0, -COLOUR_PERCENT_SUFFIX.length));

  return amount >= 0 && amount <= PERCENT_DIVISOR ? amount / PERCENT_DIVISOR : Number.NaN;
};

const getAlpha = (argument: string | undefined): number => {
  if (!argument) {
    return OPAQUE_ALPHA;
  }

  const alpha: number = argument.endsWith(COLOUR_PERCENT_SUFFIX) ? getPercentFraction(argument) : Number(argument);

  return Math.min(OPAQUE_ALPHA, Math.max(0, alpha));
};

const getRgbChannel = (argument: string): number => {
  if (argument.endsWith(COLOUR_PERCENT_SUFFIX)) {
    return getPercentFraction(argument) * COLOUR_CHANNEL_MAX;
  }

  const channel: number = Number(argument);

  return channel >= 0 && channel <= COLOUR_CHANNEL_MAX ? channel : Number.NaN;
};

const getRgbColour = (colourArguments: string[]): string | undefined => {
  const channels: number[] = [];

  for (const argument of colourArguments.slice(0, COLOUR_ALPHA_ARGUMENT_INDEX)) {
    const channel: number = getRgbChannel(argument);

    if (Number.isNaN(channel)) {
      return undefined;
    }

    channels.push(channel);
  }

  return getChannelsColour(channels);
};

const getHue = (argument: string): number => {
  const hueText: string = argument.endsWith(COLOUR_DEGREE_SUFFIX)
    ? argument.slice(0, -COLOUR_DEGREE_SUFFIX.length)
    : argument;
  const hue: number = Number(hueText);

  return ((hue % HUE_DEGREES_FULL_TURN) + HUE_DEGREES_FULL_TURN) % HUE_DEGREES_FULL_TURN;
};

const getHueChannels = (hue: number, chroma: number): number[] => {
  const sector: number = Math.floor(hue / HUE_SECTOR_DEGREES);
  const second: number = chroma * (1 - Math.abs(((hue / HUE_SECTOR_DEGREES) % HUE_SECTOR_MODULO) - 1));
  const channelsBySector: number[][] = [
    [chroma, second, 0],
    [second, chroma, 0],
    [0, chroma, second],
    [0, second, chroma],
    [second, 0, chroma],
    [chroma, 0, second],
  ];

  return channelsBySector[sector] ?? [0, 0, 0];
};

const getHslColour = (colourArguments: string[]): string | undefined => {
  const [hueArgument = '', saturationArgument = '', lightnessArgument = ''] = colourArguments;
  const saturation: number = getPercentFraction(saturationArgument);
  const lightness: number = getPercentFraction(lightnessArgument);
  const hue: number = getHue(hueArgument);

  if (Number.isNaN(saturation + lightness + hue)) {
    return undefined;
  }

  const chroma: number = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const offset: number = lightness - chroma / 2;

  return getChannelsColour(
    getHueChannels(hue, chroma).map((channel: number): number => (channel + offset) * COLOUR_CHANNEL_MAX),
  );
};

const getParsedFunctionColour = (functionName: string, argumentText: string): ParsedColour | undefined => {
  const colourArguments: string[] = argumentText.split(COLOUR_FUNCTION_ARGUMENT_SEPARATOR).filter(Boolean);
  const alpha: number = getAlpha(colourArguments[COLOUR_ALPHA_ARGUMENT_INDEX]);

  if (!RGB_ARGUMENT_COUNTS.includes(colourArguments.length) || Number.isNaN(alpha)) {
    return undefined;
  }

  const colour: string | undefined = functionName.startsWith(COLOUR_FUNCTION_RGB_PREFIX)
    ? getRgbColour(colourArguments)
    : getHslColour(colourArguments);

  return colour ? { colour, alpha } : undefined;
};

const getParsedHexAlphaColour = (text: string): ParsedColour | undefined => {
  const shortMatch: RegExpMatchArray | null = text.match(SHORT_HEX_ALPHA_COLOUR_PATTERN);
  const longMatch: RegExpMatchArray | null = text.match(LONG_HEX_ALPHA_COLOUR_PATTERN);
  const digits: string[] = shortMatch
    ? shortMatch.slice(1).map((digit: string): string => digit + digit)
    : (longMatch?.slice(1) ?? []);
  const alphaDigits: string | undefined = digits.pop();

  if (!alphaDigits) {
    return undefined;
  }

  return {
    colour: (HEX_COLOUR_PREFIX + digits.join('')).toLowerCase(),
    alpha: Number.parseInt(alphaDigits, HEX_RADIX) / COLOUR_CHANNEL_MAX,
  };
};

export const getParsedColour = (value: string): ParsedColour | undefined => {
  const trimmedValue: string = value.trim().toLowerCase();

  if (trimmedValue === TRANSPARENT_COLOUR_NAME) {
    return { colour: TRANSPARENT_COLOUR_RGB, alpha: 0 };
  }

  const functionMatch: RegExpMatchArray | null = trimmedValue.match(COLOUR_FUNCTION_PATTERN);

  if (functionMatch) {
    return getParsedFunctionColour(functionMatch[1] ?? '', functionMatch[2] ?? '');
  }

  const hexAlphaColour: ParsedColour | undefined = getParsedHexAlphaColour(trimmedValue);
  const normalizedColour: string | undefined = getNormalizedColour(trimmedValue);

  return hexAlphaColour ?? (normalizedColour ? { colour: normalizedColour, alpha: OPAQUE_ALPHA } : undefined);
};
