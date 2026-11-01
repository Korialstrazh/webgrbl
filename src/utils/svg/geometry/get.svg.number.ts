/**
 * Reads SVG numbers: a plain number, or a percentage as a fraction.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
