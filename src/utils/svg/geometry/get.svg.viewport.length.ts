/**
 * Reads a viewport length such as a nested svg's width: a percentage of the reference length, or a length in user
 * units. Gives undefined for a missing, auto or unreadable value, which means 100% of the parent viewport.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PERCENT_DIVISOR, PERCENT_SUFFIX } from '../../percent.constants';
import { getSvgLengthUserUnits } from './get.svg.length.user.units';

export const getSvgViewportLength = (value: string | null, referenceLength: number): number | undefined => {
  const trimmedValue: string = value?.trim() ?? '';
  const length: number = trimmedValue.endsWith(PERCENT_SUFFIX)
    ? (Number.parseFloat(trimmedValue) * referenceLength) / PERCENT_DIVISOR
    : getSvgLengthUserUnits(trimmedValue || undefined, NaN);

  return Number.isFinite(length) ? length : undefined;
};
