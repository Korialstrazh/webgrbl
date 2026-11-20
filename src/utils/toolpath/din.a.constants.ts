/**
 * Fixed values of the DIN A size match: the paper sizes and how far a job may differ from one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { DinASizeMm } from './interfaces/DinASizeMm';

export const DIN_A_SIZES_MM: readonly DinASizeMm[] = [
  { name: 'A0', shortMm: 841, longMm: 1189 },
  { name: 'A1', shortMm: 594, longMm: 841 },
  { name: 'A2', shortMm: 420, longMm: 594 },
  { name: 'A3', shortMm: 297, longMm: 420 },
  { name: 'A4', shortMm: 210, longMm: 297 },
  { name: 'A5', shortMm: 148, longMm: 210 },
  { name: 'A6', shortMm: 105, longMm: 148 },
  { name: 'A7', shortMm: 74, longMm: 105 },
  { name: 'A8', shortMm: 52, longMm: 74 },
  { name: 'A9', shortMm: 37, longMm: 52 },
  { name: 'A10', shortMm: 26, longMm: 37 },
];
/** Largest width or height difference, in mm, at which a job still counts as a DIN A size. */
export const DIN_A_TOLERANCE_MM = 3;
/** Size differences are compared in steps of this many mm, so float noise cannot flip a match. */
export const DIN_A_COMPARE_STEP_MM = 0.1;
