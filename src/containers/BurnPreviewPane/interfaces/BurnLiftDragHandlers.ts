/**
 * What dragging the lift axis reads and changes: the lift of the selected part, in mm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnLiftDragHandlers {
  /** The lift of the part when the drag starts. */
  getLiftMm: () => number;
  /** Sets the lift of the part while dragging. */
  setLiftMm: (liftMm: number) => void;
}
