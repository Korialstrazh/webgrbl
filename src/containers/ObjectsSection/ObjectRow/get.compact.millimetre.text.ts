/**
 * The short text of a size in millimetres for the Objects row: one decimal below 100 mm, whole millimetres from there,
 * so a large drawing's size fits the row beside its warning chip and actions instead of being cut off.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { OBJECT_MILLIMETRE_DECIMALS } from '../objects.section.constants';

const WHOLE_MILLIMETRES_FROM_MM = 100;

export const getCompactMillimetreText = (millimetres: number): string =>
  millimetres.toFixed(Math.abs(millimetres) >= WHOLE_MILLIMETRES_FROM_MM ? 0 : OBJECT_MILLIMETRE_DECIMALS);
