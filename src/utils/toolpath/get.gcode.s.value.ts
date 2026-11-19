/**
 * Gets the S value for a power percent: clamped to 0 to 100 percent, so it never passes the S max; a value that
 * is not a number counts as 0.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { FULL_POWER_PERCENT, NO_POWER_PERCENT } from './gcode.constants';

export const getGcodeSValue = (powerPercent: number, sValueMax: number): number => {
  const finitePercent: number = Number.isFinite(powerPercent) ? powerPercent : NO_POWER_PERCENT;
  const clampedPercent: number = Math.min(FULL_POWER_PERCENT, Math.max(NO_POWER_PERCENT, finitePercent));

  return Math.min(sValueMax, Math.round((sValueMax * clampedPercent) / FULL_POWER_PERCENT));
};
