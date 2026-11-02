/**
 * What choosing the labelled positions along one ruler needs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedRulerTickRequest {
  /** The first bed position in view along the ruler, in millimetres. */
  visibleStartMm: number;
  /** The last bed position in view along the ruler, in millimetres. */
  visibleEndMm: number;
  /** The bed length along the ruler; no label lies past it. */
  bedLengthMm: number;
  /** How many CSS pixels one millimetre takes on screen. */
  pixelsPerMm: number;
  /** The least distance between two labels, in CSS pixels. */
  minSpacingPx: number;
}
