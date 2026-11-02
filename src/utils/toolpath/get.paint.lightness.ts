/**
 * Gets the lightness of a paint composited over white, so partial opacity makes a colour lighter (50 % black counts as
 * mid-grey).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getColourLightness } from '../layers/get.colour.lightness';
import { WHITE_LIGHTNESS } from './toolpath.constants';

export const getPaintLightness = (colour: string, opacity: number): number =>
  WHITE_LIGHTNESS - opacity * (WHITE_LIGHTNESS - getColourLightness(colour));
