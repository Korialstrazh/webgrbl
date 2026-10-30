import { isFiniteNumber } from './is.finite.number';

/**
 * Tells whether a value is missing (undefined) or a finite number; null, false, empty text and NaN are not accepted.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const isOptionalFiniteNumber = (value: unknown): value is number | undefined =>
  typeof value === 'undefined' || isFiniteNumber(value);
