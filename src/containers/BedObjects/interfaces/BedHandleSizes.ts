/**
 * The sizes of the selection handles in bed millimetres, worked out so they have a fixed size on screen.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedHandleSizes {
  /** Side of a square corner handle, and the diameter of the rotate handle. */
  handleSizeMm: number;
  /** Length of the arm from the selection box to the rotate handle. */
  rotateArmMm: number;
}
