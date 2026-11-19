/**
 * The number a field commits on blur or Enter: what was typed, held inside its limits, or nothing when the field
 * was left empty or holds no number, so the last valid value stays.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getNumberInRange } from './get.number.in.range';
import { isFiniteNumber } from './type.guards/is.finite.number';

export const getCommittedNumber = (
  typedValue: number | null | undefined,
  minValue: number = Number.NEGATIVE_INFINITY,
  maxValue: number = Number.POSITIVE_INFINITY,
): number | undefined => (isFiniteNumber(typedValue) ? getNumberInRange(typedValue, minValue, maxValue) : undefined);
