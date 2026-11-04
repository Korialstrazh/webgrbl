/**
 * Gets a number rounded to the given count of decimals.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getRoundedNumber = (value: number, decimals: number): number => Number(value.toFixed(decimals));
