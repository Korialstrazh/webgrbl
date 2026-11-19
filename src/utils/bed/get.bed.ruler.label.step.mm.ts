/**
 * Gets the step between two ruler labels: the smallest of the ruler steps that keeps two labels at least the minimum
 * spacing apart at the current scale.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BED_RULER_STEPS_MM } from './bed.ruler.constants';

const LARGEST_STEP_MM: number = BED_RULER_STEPS_MM[BED_RULER_STEPS_MM.length - 1] ?? 1;

export const getBedRulerLabelStepMm = (pixelsPerMm: number, minSpacingPx: number): number =>
  BED_RULER_STEPS_MM.find((stepMm: number): boolean => stepMm * pixelsPerMm >= minSpacingPx) ?? LARGEST_STEP_MM;
