/**
 * The CSS colour names that design tools commonly write, with their #rrggbb values, and the colour notation patterns.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
export const COLOUR_CHANNEL_MAX = 255;
export const HEX_RADIX = 16;
export const HEX_CHANNEL_DIGITS = 2;
export const HEX_COLOUR_PREFIX = '#';
