/**
 * Tells whether a colour is on the grey axis, where the channels differ by at most the grey tolerance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getColourChannels } from './get.colour.channels';
import { GREY_AXIS_TOLERANCE } from './layer.constants';
import type { ColourChannels } from './interfaces/ColourChannels';

export const isGreyColour = (colour: string): boolean => {
  const { red, green, blue }: ColourChannels = getColourChannels(colour);

  return Math.max(red, green, blue) - Math.min(red, green, blue) <= GREY_AXIS_TOLERANCE;
};
