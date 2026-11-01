/**
 * Turns a CSS colour (name, #rgb, #rrggbb or rgb()) into lowercase #rrggbb; anything else, such as none or url(),
 * gives undefined.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  COLOUR_CHANNEL_MAX,
  HEX_CHANNEL_DIGITS,
  HEX_COLOUR_PREFIX,
  HEX_PAD_DIGIT,
  HEX_RADIX,
  LONG_HEX_COLOUR_PATTERN,
  NAMED_COLOURS,
  RGB_FUNCTION_COLOUR_PATTERN,
  SHORT_HEX_COLOUR_PATTERN,
} from './colour.constants';

const getChannelHex = (channelValue: number): string =>
  channelValue.toString(HEX_RADIX).padStart(HEX_CHANNEL_DIGITS, HEX_PAD_DIGIT);

const getNormalizedRgbFunction = (channelTexts: string[]): string | undefined => {
  const channelValues: number[] = channelTexts.map((channelText: string): number => Number(channelText));

  if (channelValues.some((channelValue: number): boolean => channelValue > COLOUR_CHANNEL_MAX)) {
    return undefined;
  }

  return HEX_COLOUR_PREFIX + channelValues.map(getChannelHex).join('');
};

export const getNormalizedColour = (value: string): string | undefined => {
  const trimmedValue: string = value.trim();
  const namedColour: string | undefined = Object.hasOwn(NAMED_COLOURS, trimmedValue.toLowerCase())
    ? NAMED_COLOURS[trimmedValue.toLowerCase()]
    : undefined;

  if (namedColour) {
    return namedColour;
  }

  if (LONG_HEX_COLOUR_PATTERN.test(trimmedValue)) {
    return trimmedValue.toLowerCase();
  }

  const shortMatch: RegExpMatchArray | null = trimmedValue.match(SHORT_HEX_COLOUR_PATTERN);

  if (shortMatch) {
    const expandedDigits: string = shortMatch.slice(1).map((digit: string): string => digit + digit).join('');

    return (HEX_COLOUR_PREFIX + expandedDigits).toLowerCase();
  }

  const rgbMatch: RegExpMatchArray | null = trimmedValue.match(RGB_FUNCTION_COLOUR_PATTERN);

  return rgbMatch ? getNormalizedRgbFunction(rgbMatch.slice(1)) : undefined;
};
