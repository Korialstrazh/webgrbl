/**
 * A part of a cubic curve waiting to be flattened, with how many times it has been split already.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgCubicCurve } from './SvgCubicCurve';

export interface SvgCurvePiece {
  /** The part of the curve. */
  curve: SvgCubicCurve;
  /** How many halvings it took to get this part. */
  depth: number;
}
