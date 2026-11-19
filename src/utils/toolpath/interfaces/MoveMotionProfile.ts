/**
 * How the head moves along one move: speeds, acceleration and the time it takes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MoveMotionProfile {
  /** Length of the move in mm. */
  lengthMm: number;
  /** Speed at the start of the move in mm per second. */
  entrySpeedMmPerS: number;
  /** Highest speed reached in the move in mm per second; the cruise speed when the move is long enough. */
  peakSpeedMmPerS: number;
  /** Speed at the end of the move in mm per second. */
  exitSpeedMmPerS: number;
  /** Acceleration and deceleration along the move in mm per second squared. */
  accelerationMmPerS2: number;
  /** Time the move takes in seconds. */
  durationS: number;
}
