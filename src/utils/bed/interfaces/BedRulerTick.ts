/**
 * One tick mark in a ruler band: where it sits along the band and whether it is a long tick, at a labelled step, or a
 * short one between two labels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedRulerTick {
  /** Where the tick lies along its band, from the left or top edge of the bed drawing, in CSS pixels. */
  offsetPx: number;
  /** Whether the tick marks a labelled step and is drawn long. */
  isMajor: boolean;
}
