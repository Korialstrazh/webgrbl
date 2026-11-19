/**
 * Reads an SVG number that is a fraction, such as an opacity or a gradient offset, kept between 0 and 1.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgNumber } from './get.svg.number';

export const getSvgFraction = (value: string | undefined, fallback: number): number =>
  Math.min(1, Math.max(0, getSvgNumber(value, fallback)));
