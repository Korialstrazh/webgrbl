import { isFiniteNumber } from './is.finite.number';

/**
 * Tells whether a value is missing (undefined) or a finite number; null, false, empty text and NaN are not accepted.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const isOptionalFiniteNumber = (value: unknown): value is number | undefined =>
  typeof value === 'undefined' || isFiniteNumber(value);
