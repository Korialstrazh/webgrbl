/**
 * The outline the frame job traces, in bed millimetres.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
