/**
 * A point or a distance on the bed in the machine frame: millimetres from the front-left corner, Y away from the user.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedMachinePoint {
  /** Distance to the right. */
  x: number;
  /** Distance away from the user, up on screen. */
  y: number;
}
