/**
 * Formats a number for G-code: at most 3 decimals, no trailing zeros, never negative zero.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GCODE_MAX_DECIMALS } from './machine.command.constants';

export const getFormattedGcodeNumber = (value: number): string => {
  const roundedValue: number = Number(value.toFixed(GCODE_MAX_DECIMALS));

  return String(roundedValue === 0 ? 0 : roundedValue);
};
