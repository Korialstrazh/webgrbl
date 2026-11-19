/**
 * Gets a number rounded to the given count of decimals.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const getRoundedNumber = (value: number, decimals: number): number => Number(value.toFixed(decimals));
