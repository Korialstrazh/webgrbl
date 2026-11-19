/**
 * A point in an object's own drawing frame on the bed: millimetres from its box centre before the turn, Y down.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ObjectFramePoint {
  /** Distance right of the box centre. */
  x: number;
  /** Distance below the box centre. */
  y: number;
}
