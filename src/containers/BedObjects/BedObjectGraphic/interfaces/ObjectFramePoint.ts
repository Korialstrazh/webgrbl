/**
 * A point in an object's own drawing frame on the bed: millimetres from its box centre before the turn, Y down.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ObjectFramePoint {
  /** Distance right of the box centre. */
  x: number;
  /** Distance below the box centre. */
  y: number;
}
