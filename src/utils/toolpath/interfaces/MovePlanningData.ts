/**
 * What the planner needs to know about one move that has a length.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MoveDirection } from './MoveDirection';

export interface MovePlanningData {
  /** Index of the move in the toolpath. */
  moveIndex: number;
  /** Unit direction of the move. */
  direction: MoveDirection;
  /** Speed the move cruises at when it is long enough, in mm per second. */
  nominalSpeedMmPerS: number;
  /** Acceleration and deceleration along the move in mm per second squared. */
  accelerationMmPerS2: number;
  /** Length of the move in mm. */
  lengthMm: number;
}
