/**
 * The inputs that fix the motion of one move.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MoveMotionProfileInput {
  /** Length of the move in mm. */
  lengthMm: number;
  /** Speed at the start of the move in mm per second. */
  entrySpeedMmPerS: number;
  /** Speed at the end of the move in mm per second. */
  exitSpeedMmPerS: number;
  /** Speed the move cruises at when it is long enough, in mm per second. */
  nominalSpeedMmPerS: number;
  /** Acceleration and deceleration along the move in mm per second squared. */
  accelerationMmPerS2: number;
}
