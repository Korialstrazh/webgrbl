/**
 * The outline the frame job traces, in bed millimetres.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface FrameRectangle {
  /** Left side of the outline. */
  minX: number;
  /** Front side of the outline. */
  minY: number;
  /** Right side of the outline. */
  maxX: number;
  /** Back side of the outline. */
  maxY: number;
}
