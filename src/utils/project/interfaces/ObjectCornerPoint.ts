/**
 * One corner of an object's box in the machine frame, in millimetres.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ObjectCornerPoint {
  /** Distance from the bed's left edge. */
  x: number;
  /** Distance from the bed's front edge. */
  y: number;
}
