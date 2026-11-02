/**
 * Gets a number brought into a range: below the range gives the lower limit, above it the upper limit.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getNumberInRange = (value: number, lowerLimit: number, upperLimit: number): number =>
  Math.min(Math.max(value, lowerLimit), upperLimit);
