/**
 * The inputs that fix the motion of one move.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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
