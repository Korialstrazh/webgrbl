/**
 * The axis-aligned box around an object's drawn artwork on the bed, in machine millimetres, after its rotation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ObjectArtworkBedBounds {
  /** Left edge, in millimetres. */
  minXMm: number;
  /** Front edge, in millimetres. */
  minYMm: number;
  /** Right edge, in millimetres. */
  maxXMm: number;
  /** Back edge, in millimetres. */
  maxYMm: number;
}
