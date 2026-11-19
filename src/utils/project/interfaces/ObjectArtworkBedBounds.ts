/**
 * The axis-aligned box around an object's drawn artwork on the bed, in machine millimetres, after its rotation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
