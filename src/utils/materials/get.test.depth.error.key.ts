/**
 * Gets the translation key of the problem with an entered burn depth: it must be above 0 and at most the thickness.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import { isFiniteNumber } from '../type.guards/is.finite.number';

export const getTestDepthErrorKey = (depthMm: number, thicknessMm: number): string | undefined =>
  isFiniteNumber(depthMm) && depthMm > 0 && depthMm <= thicknessMm
    ? undefined
    : DEFAULT.TEST_SAMPLE_DIALOG_DEPTH_INVALID;
