/**
 * Gets the lightness of a paint composited over white, so partial opacity makes a colour lighter (50 % black counts as
 * mid-grey).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getColourLightness } from '../layers/get.colour.lightness';
import { WHITE_LIGHTNESS } from './toolpath.constants';

export const getPaintLightness = (colour: string, opacity: number): number =>
  WHITE_LIGHTNESS - opacity * (WHITE_LIGHTNESS - getColourLightness(colour));
