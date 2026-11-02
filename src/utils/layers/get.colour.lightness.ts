/**
 * Gives the lightness of a colour from 0 (black) to 1 (white) as the average of its channels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getColourChannels } from './get.colour.channels';
import { COLOUR_CHANNEL_COUNT } from './layer.constants';
import type { ColourChannels } from './interfaces/ColourChannels';
import { COLOUR_CHANNEL_MAX } from '../palette/colour.constants';

export const getColourLightness = (colour: string): number => {
  const { red, green, blue }: ColourChannels = getColourChannels(colour);

  return (red + green + blue) / (COLOUR_CHANNEL_COUNT * COLOUR_CHANNEL_MAX);
};
