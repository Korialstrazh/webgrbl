/**
 * Reads an SVG number that is a fraction, such as an opacity or a gradient offset, kept between 0 and 1.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgNumber } from './get.svg.number';

export const getSvgFraction = (value: string | undefined, fallback: number): number =>
  Math.min(1, Math.max(0, getSvgNumber(value, fallback)));
