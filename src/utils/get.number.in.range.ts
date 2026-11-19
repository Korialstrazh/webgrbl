/**
 * Gets a number brought into a range: below the range gives the lower limit, above it the upper limit.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const getNumberInRange = (value: number, lowerLimit: number, upperLimit: number): number =>
  Math.min(Math.max(value, lowerLimit), upperLimit);
