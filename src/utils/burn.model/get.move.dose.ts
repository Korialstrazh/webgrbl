/**
 * Returns the dose of one move: laser power divided by feed rate.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const getMoveDose = (powerPercent: number, feedMmPerMin: number): number => {
  if (feedMmPerMin <= 0) {
    return 0;
  }

  return powerPercent / feedMmPerMin;
};
