/**
 * A part of a cubic curve waiting to be flattened, with how many times it has been split already.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgCubicCurve } from './SvgCubicCurve';

export interface SvgCurvePiece {
  /** The part of the curve. */
  curve: SvgCubicCurve;
  /** How many halvings it took to get this part. */
  depth: number;
}
