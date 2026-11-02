/**
 * The height of one fill line and the height it is sampled at.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface FillLineHeight {
  /** Height of the line in bed mm, where the head burns it. */
  y: number;
  /** Height the artwork is sampled at: the line height, moved just inside the layer box at its top and bottom edge. */
  sampleY: number;
}
