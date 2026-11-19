/**
 * The sizes of the selection handles in bed millimetres, worked out so they have a fixed size on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedHandleSizes {
  /** Side of a square corner handle, and the diameter of the rotate handle. */
  handleSizeMm: number;
  /** Length of the arm from the selection box to the rotate handle. */
  rotateArmMm: number;
}
