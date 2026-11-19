/**
 * The number a field commits on blur or Enter: what was typed, held inside its limits, or nothing when the field
 * was left empty or holds no number, so the last valid value stays.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getNumberInRange } from './get.number.in.range';
import { isFiniteNumber } from './type.guards/is.finite.number';

export const getCommittedNumber = (
  typedValue: number | null | undefined,
  minValue: number = Number.NEGATIVE_INFINITY,
  maxValue: number = Number.POSITIVE_INFINITY,
): number | undefined => (isFiniteNumber(typedValue) ? getNumberInRange(typedValue, minValue, maxValue) : undefined);
