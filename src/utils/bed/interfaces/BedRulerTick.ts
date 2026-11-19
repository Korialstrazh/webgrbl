/**
 * One tick mark in a ruler band: where it sits along the band and whether it is a long tick, at a labelled step, or a
 * short one between two labels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedRulerTick {
  /** Where the tick lies along its band, from the left or top edge of the bed drawing, in CSS pixels. */
  offsetPx: number;
  /** Whether the tick marks a labelled step and is drawn long. */
  isMajor: boolean;
}
