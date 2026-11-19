/**
 * Reads SVG numbers: a plain number, or a percentage as a fraction.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PERCENT_DIVISOR, PERCENT_SUFFIX } from '../../percent.constants';

export const getSvgNumber = (value: string | null | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const trimmedValue: string = value.trim();
  const parsedNumber: number = Number.parseFloat(trimmedValue);

  if (Number.isNaN(parsedNumber)) {
    return fallback;
  }

  return trimmedValue.endsWith(PERCENT_SUFFIX) ? parsedNumber / PERCENT_DIVISOR : parsedNumber;
};
