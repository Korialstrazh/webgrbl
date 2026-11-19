/**
 * Gets the translation key of the problem with an entered burn depth: it must be above 0 and at most the thickness.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../localization/default.locales';
import { isFiniteNumber } from '../type.guards/is.finite.number';

export const getTestDepthErrorKey = (depthMm: number, thicknessMm: number): string | undefined =>
  isFiniteNumber(depthMm) && depthMm > 0 && depthMm <= thicknessMm
    ? undefined
    : DEFAULT.TEST_SAMPLE_DIALOG_DEPTH_INVALID;
