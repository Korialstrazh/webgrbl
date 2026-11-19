/**
 * The CSS colour names that design tools commonly write, with their #rrggbb values, and the colour notation patterns.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const NAMED_COLOURS: Record<string, string> = {
  black: '#000000',
  silver: '#c0c0c0',
  gray: '#808080',
  grey: '#808080',
  white: '#ffffff',
  maroon: '#800000',
  red: '#ff0000',
  purple: '#800080',
  fuchsia: '#ff00ff',
  green: '#008000',
  lime: '#00ff00',
  olive: '#808000',
  yellow: '#ffff00',
  navy: '#000080',
  blue: '#0000ff',
  teal: '#008080',
  aqua: '#00ffff',
  orange: '#ffa500',
};

export const SHORT_HEX_COLOUR_PATTERN = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
export const LONG_HEX_COLOUR_PATTERN = /^#[0-9a-f]{6}$/i;
export const RGB_FUNCTION_COLOUR_PATTERN = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
export const COLOUR_CHANNEL_MIN = 0;
export const COLOUR_CHANNEL_MAX = 255;
export const HEX_RADIX = 16;
export const HEX_CHANNEL_DIGITS = 2;
export const HEX_COLOUR_PREFIX = '#';
export const HEX_PAD_DIGIT = '0';

export const TRANSPARENT_COLOUR_NAME = 'transparent';
export const TRANSPARENT_COLOUR_RGB = '#000000';
export const OPAQUE_ALPHA = 1;
export const TRANSPARENT_ALPHA = 0;
export const SHORT_HEX_ALPHA_COLOUR_PATTERN = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/i;
export const LONG_HEX_ALPHA_COLOUR_PATTERN = /^#([0-9a-f]{6})([0-9a-f]{2})$/i;
export const COLOUR_FUNCTION_PATTERN = /^(rgba?|hsla?)\(\s*([^()]*?)\s*\)$/i;
export const COLOUR_FUNCTION_ARGUMENT_SEPARATOR = /[\s,/]+/;
export const COLOUR_FUNCTION_RGB_PREFIX = 'rgb';
export const COLOUR_DEGREE_SUFFIX = 'deg';
export const RGB_ARGUMENT_COUNT = 3;
export const RGBA_ARGUMENT_COUNT = 4;
export const RGB_ARGUMENT_COUNTS: readonly number[] = [RGB_ARGUMENT_COUNT, RGBA_ARGUMENT_COUNT];
export const COLOUR_ALPHA_ARGUMENT_INDEX = RGB_ARGUMENT_COUNT;
export const HUE_DEGREES_FULL_TURN = 360;
export const HUE_SECTOR_DEGREES = 60;
export const HUE_SECTOR_MODULO = 2;
export const HUE_NO_CHANNEL = 0;
export const HSL_LIGHTNESS_FACTOR = 2;
export const HSL_CHROMA_HALVING_DIVISOR = 2;
