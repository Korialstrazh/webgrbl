/**
 * The sizes of the ruler text in one ruler layout, in CSS pixels.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedRulerTextSizes {
  fontSizePx: number;
  /** The gap between a label and its position. */
  labelOffsetPx: number;
  /** The least distance between two labels. */
  minSpacingPx: number;
}
