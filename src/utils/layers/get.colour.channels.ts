/**
 * Splits a lowercase #rrggbb colour into its channels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ColourChannels } from './interfaces/ColourChannels';
import { HEX_CHANNEL_DIGITS, HEX_RADIX } from '../palette/colour.constants';

const RED_START = 1;
const GREEN_START = RED_START + HEX_CHANNEL_DIGITS;
const BLUE_START = GREEN_START + HEX_CHANNEL_DIGITS;

const getChannel = (colour: string, start: number): number =>
  Number.parseInt(colour.slice(start, start + HEX_CHANNEL_DIGITS), HEX_RADIX);

export const getColourChannels = (colour: string): ColourChannels => ({
  red: getChannel(colour, RED_START),
  green: getChannel(colour, GREEN_START),
  blue: getChannel(colour, BLUE_START),
});
