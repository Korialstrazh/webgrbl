/**
 * A point or a distance on the bed in the machine frame: millimetres from the front-left corner, Y away from the user.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedMachinePoint {
  /** Distance to the right. */
  x: number;
  /** Distance away from the user, up on screen. */
  y: number;
}
