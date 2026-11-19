/**
 * Tells whether a colour is on the grey axis, where the channels differ by at most the grey tolerance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getColourChannels } from './get.colour.channels';
import { GREY_AXIS_TOLERANCE } from './layer.constants';
import type { ColourChannels } from './interfaces/ColourChannels';

export const isGreyColour = (colour: string): boolean => {
  const { red, green, blue }: ColourChannels = getColourChannels(colour);

  return Math.max(red, green, blue) - Math.min(red, green, blue) <= GREY_AXIS_TOLERANCE;
};
