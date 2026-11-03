/**
 * Returns the dose of one move: laser power divided by feed rate.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getMoveDose = (powerPercent: number, feedMmPerMin: number): number => {
  if (feedMmPerMin <= 0) {
    return 0;
  }

  return powerPercent / feedMmPerMin;
};
