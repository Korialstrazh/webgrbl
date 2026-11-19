/**
 * The sizes of the ruler text and the tick spacing in one ruler layout, in CSS pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedRulerTextSizes {
  fontSizePx: number;
  /** The gap between a label and its position. */
  labelOffsetPx: number;
  /** The least distance between two labels. */
  minSpacingPx: number;
  /** The least distance between two short ticks. */
  minMinorTickSpacingPx: number;
}
